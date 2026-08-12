"""Aggregates for the user's dashboard home screen."""

from datetime import datetime, timedelta

from fastapi import APIRouter
from sqlalchemy import func

from api.deps import CurrentUser, DbSession
from models.academic import WEEKDAYS, ClassSchedule
from models.emergency import EmergencyContact
from models.navigation import Location, NavigationHistory, Node
from models.notification import Notification

router = APIRouter()


@router.get("/stats")
def stats(user: CurrentUser, db: DbSession) -> dict:
    total_navigations = (
        db.query(func.count(NavigationHistory.history_id))
        .filter(NavigationHistory.user_id == user.user_id)
        .scalar()
        or 0
    )
    distinct_places = (
        db.query(func.count(func.distinct(NavigationHistory.destination_node_id)))
        .filter(NavigationHistory.user_id == user.user_id)
        .scalar()
        or 0
    )
    upcoming = db.query(func.count(ClassSchedule.class_id)).scalar() or 0
    unread = (
        db.query(func.count(Notification.notification_id))
        .filter(Notification.user_id == user.user_id, Notification.is_read.is_(False))
        .scalar()
        or 0
    )
    contacts = (
        db.query(func.count(EmergencyContact.contact_id))
        .filter(EmergencyContact.user_id == user.user_id)
        .scalar()
        or 0
    )

    week_ago = datetime.utcnow() - timedelta(days=7)
    this_week = (
        db.query(func.count(NavigationHistory.history_id))
        .filter(
            NavigationHistory.user_id == user.user_id,
            NavigationHistory.navigation_date >= week_ago,
        )
        .scalar()
        or 0
    )

    return {
        "totalNavigations": total_navigations,
        "savedLocations": distinct_places,
        "upcomingClasses": upcoming,
        "unreadNotifications": unread,
        "emergencyContacts": contacts,
        "navigationsThisWeek": this_week,
    }


@router.get("/upcoming-classes")
def upcoming_classes(db: DbSession, limit: int = 5) -> list[dict]:
    """
    The next few classes, ordered from today forward and wrapping into next week
    so the list is never empty mid-week.
    """
    today_index = datetime.utcnow().weekday()
    rows = db.query(ClassSchedule).all()

    def sort_key(row: ClassSchedule) -> tuple[int, object]:
        try:
            day_index = WEEKDAYS.index(row.day_of_week)
        except ValueError:
            day_index = 7
        return ((day_index - today_index) % 7, row.start_time)

    rows.sort(key=sort_key)
    return [row.to_dict() for row in rows[:limit]]


@router.get("/recent-locations")
def recent_locations(user: CurrentUser, db: DbSession, limit: int = 6) -> list[dict]:
    """Most-visited destinations for this user, newest visit first."""
    rows = (
        db.query(
            NavigationHistory.destination_node_id.label("node_id"),
            func.count(NavigationHistory.history_id).label("frequency"),
            func.max(NavigationHistory.navigation_date).label("last_visited"),
        )
        .filter(
            NavigationHistory.user_id == user.user_id,
            NavigationHistory.destination_node_id.isnot(None),
        )
        .group_by(NavigationHistory.destination_node_id)
        .order_by(func.max(NavigationHistory.navigation_date).desc())
        .limit(min(limit, 50))
        .all()
    )

    results: list[dict] = []
    for row in rows:
        location = db.query(Location).filter(Location.node_id == row.node_id).first()
        node = db.get(Node, row.node_id)
        floor = location.floor if location else None
        building = floor.building if floor else None
        results.append(
            {
                "id": row.node_id,
                "nodeId": row.node_id,
                "name": location.display_label
                if location
                else (node.node_name if node else row.node_id),
                "building": building.building_name if building else "",
                "floor": floor.floor_name if floor else "",
                "lastVisited": row.last_visited.isoformat() if row.last_visited else None,
                "frequency": row.frequency,
            }
        )
    return results
