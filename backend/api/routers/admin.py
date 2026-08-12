"""Administrator tools: users, buildings, alerts, broadcasts, and analytics."""

from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func

from api.deps import CurrentAdmin, DbSession
from models.emergency import ALERT_ACTIVE, EmergencyAlert
from models.navigation import Building, Floor, Location, NavigationHistory, Node
from models.notification import Notification
from models.user import ROLE_ADMIN, ROLE_USER, User
from schemas.admin import BroadcastRequest, UpdateUserRequest
from schemas.navigation import CreateBuildingRequest, CreateFloorRequest

router = APIRouter()


@router.get("/stats")
def platform_stats(admin: CurrentAdmin, db: DbSession) -> dict:
    week_ago = datetime.utcnow() - timedelta(days=7)

    total_users = db.query(func.count(User.user_id)).scalar() or 0
    new_users = (
        db.query(func.count(User.user_id)).filter(User.created_at >= week_ago).scalar() or 0
    )
    active_navigations = (
        db.query(func.count(NavigationHistory.history_id))
        .filter(NavigationHistory.navigation_date >= week_ago)
        .scalar()
        or 0
    )
    buildings = db.query(func.count(Building.building_id)).scalar() or 0
    active_alerts = (
        db.query(func.count(EmergencyAlert.alert_id))
        .filter(EmergencyAlert.status == ALERT_ACTIVE)
        .scalar()
        or 0
    )
    mapped_nodes = db.query(func.count(Node.node_id)).scalar() or 0
    mapped_locations = db.query(func.count(Location.location_id)).scalar() or 0

    return {
        "totalUsers": total_users,
        "newUsersThisWeek": new_users,
        "navigationsThisWeek": active_navigations,
        "buildingsMapped": buildings,
        "activeAlerts": active_alerts,
        "graphNodes": mapped_nodes,
        "mappedLocations": mapped_locations,
    }


@router.get("/users")
def list_users(admin: CurrentAdmin, db: DbSession, limit: int = 100) -> list[dict]:
    users = (
        db.query(User).order_by(User.created_at.desc()).limit(min(limit, 500)).all()
    )
    return [user.to_dict() for user in users]


@router.patch("/users/{user_id}")
def update_user(
    user_id: int, payload: UpdateUserRequest, admin: CurrentAdmin, db: DbSession
) -> dict:
    target = db.get(User, user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if target.user_id == admin.user_id and (
        payload.role == "user" or payload.accountStatus == "SUSPENDED"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own administrator access",
        )

    if payload.role is not None:
        target.role_id = ROLE_ADMIN if payload.role == "admin" else ROLE_USER
    if payload.accountStatus is not None:
        target.account_status = payload.accountStatus

    db.commit()
    db.refresh(target)
    return target.to_dict()


@router.get("/alerts")
def list_all_alerts(admin: CurrentAdmin, db: DbSession, activeOnly: bool = False) -> list[dict]:
    stmt = db.query(EmergencyAlert)
    if activeOnly:
        stmt = stmt.filter(EmergencyAlert.status == ALERT_ACTIVE)
    alerts = stmt.order_by(EmergencyAlert.created_at.desc()).limit(100).all()
    return [alert.to_dict() for alert in alerts]


@router.post("/buildings", status_code=status.HTTP_201_CREATED)
def create_building(
    payload: CreateBuildingRequest, admin: CurrentAdmin, db: DbSession
) -> dict:
    existing = (
        db.query(Building).filter(Building.building_code == payload.code).first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A building with code {payload.code} already exists",
        )

    building = Building(
        building_code=payload.code,
        building_name=payload.name,
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        total_floors=payload.totalFloors,
    )
    db.add(building)
    db.commit()
    db.refresh(building)
    return building.to_dict()


@router.post("/floors", status_code=status.HTTP_201_CREATED)
def create_floor(payload: CreateFloorRequest, admin: CurrentAdmin, db: DbSession) -> dict:
    building = db.get(Building, payload.buildingId)
    if building is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Building not found"
        )

    floor = Floor(
        building_id=building.building_id,
        floor_no=payload.floorNo,
        floor_name=payload.floorName,
    )
    db.add(floor)
    db.commit()
    db.refresh(floor)
    return floor.to_dict()


@router.post("/notifications", status_code=status.HTTP_201_CREATED)
def broadcast(payload: BroadcastRequest, admin: CurrentAdmin, db: DbSession) -> dict:
    recipients = db.query(User.user_id).filter(User.account_status == "ACTIVE").all()
    for (user_id,) in recipients:
        db.add(
            Notification(
                user_id=user_id,
                notification_type=payload.type,
                title=payload.title,
                message=payload.message,
                action_url=payload.actionUrl,
            )
        )
    db.commit()
    return {"sent": len(recipients), "message": f"Notification sent to {len(recipients)} users"}


@router.get("/activity")
def recent_activity(admin: CurrentAdmin, db: DbSession, limit: int = 15) -> list[dict]:
    """A merged, newest-first feed of real events rather than a static list."""
    events: list[dict] = []

    for user in db.query(User).order_by(User.created_at.desc()).limit(limit).all():
        events.append(
            {
                "type": "user",
                "action": f"New user registered: {user.display_name}",
                "timestamp": user.created_at.isoformat() if user.created_at else None,
            }
        )

    for alert in (
        db.query(EmergencyAlert).order_by(EmergencyAlert.created_at.desc()).limit(limit).all()
    ):
        events.append(
            {
                "type": "alert",
                "action": f"{alert.alert_type.upper()} alert raised"
                + (f" by {alert.user.display_name}" if alert.user else ""),
                "timestamp": alert.created_at.isoformat() if alert.created_at else None,
            }
        )

    for history in (
        db.query(NavigationHistory)
        .order_by(NavigationHistory.navigation_date.desc())
        .limit(limit)
        .all()
    ):
        events.append(
            {
                "type": "navigation",
                "action": f"Route calculated to {history.destination_node_id}",
                "timestamp": history.navigation_date.isoformat()
                if history.navigation_date
                else None,
            }
        )

    events.sort(key=lambda event: event["timestamp"] or "", reverse=True)
    return events[:limit]
