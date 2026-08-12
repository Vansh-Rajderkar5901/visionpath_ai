"""Buildings, destinations, facilities, and route calculation."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from api.deps import CurrentUser, DbSession
from models.navigation import FACILITY_TYPES, Building, Floor, Location, NavigationHistory
from schemas.navigation import RouteRequest
from services.navigation_service import NavigationError, NavigationService

router = APIRouter()


@router.get("/buildings")
def list_buildings(db: DbSession) -> list[dict]:
    return [building.to_dict() for building in NavigationService(db).buildings()]


@router.get("/buildings/{building_code}")
def get_building(building_code: str, db: DbSession) -> dict:
    building = (
        db.query(Building).filter(Building.building_code == building_code).first()
    )
    if building is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Building not found"
        )
    return building.to_dict()


@router.get("/buildings/{building_code}/floors")
def list_floors(building_code: str, db: DbSession) -> list[dict]:
    building = (
        db.query(Building).filter(Building.building_code == building_code).first()
    )
    if building is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Building not found"
        )
    return [floor.to_dict() for floor in building.floors]


@router.get("/destinations")
def list_destinations(
    db: DbSession,
    query: Optional[str] = Query(default=None, max_length=128),
) -> list[dict]:
    return [
        location.to_dict() for location in NavigationService(db).destinations(query)
    ]


@router.get("/facilities")
def list_facilities(
    db: DbSession,
    buildingCode: Optional[str] = None,
    floorLevel: Optional[int] = None,
    type: Optional[str] = None,
) -> list[dict]:
    stmt = (
        db.query(Location)
        .join(Location.location_type)
        .join(Location.floor)
        .join(Floor.building)
    )
    if buildingCode:
        stmt = stmt.filter(Building.building_code == buildingCode)
    if floorLevel is not None:
        stmt = stmt.filter(Floor.floor_no == floorLevel)

    locations = stmt.all()
    wanted = {type} if type else set(FACILITY_TYPES)
    return [
        location.to_facility_dict()
        for location in locations
        if location.type_name in wanted
    ]


@router.get("/nodes")
def list_nodes(db: DbSession) -> list[dict]:
    """
    Every routable point, with the place it belongs to when there is one.
    The indoor page uses this to populate the "I am here" picker.
    """
    from models.navigation import Node

    nodes = db.query(Node).order_by(Node.node_name).all()
    return [
        {
            **node.to_dict(),
            "locationId": node.locations[0].location_id if node.locations else None,
            "locationName": node.locations[0].display_label if node.locations else None,
        }
        for node in nodes
    ]


@router.get("/graph")
def get_graph(db: DbSession) -> dict:
    """The raw adjacency map — useful for debugging and for admin map tooling."""
    return NavigationService(db).load_graph()


@router.post("/route")
def calculate_route(payload: RouteRequest, user: CurrentUser, db: DbSession) -> dict:
    service = NavigationService(db)

    try:
        start = (
            service.resolve_location_node(payload.fromLocationId)
            if payload.fromLocationId is not None
            else service.resolve_node(payload.fromNode or "")
        )
        end = (
            service.resolve_location_node(payload.toLocationId)
            if payload.toLocationId is not None
            else service.resolve_node(payload.toNode or "")
        )
        result = service.route(start.node_id, end.node_id)
    except NavigationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    if payload.record:
        destination_location = (
            db.query(Location).filter(Location.node_id == end.node_id).first()
        )
        db.add(
            NavigationHistory(
                user_id=user.user_id,
                source_node_id=start.node_id,
                destination_node_id=end.node_id,
                destination_location_id=(
                    destination_location.location_id if destination_location else None
                ),
                distance=result["distance"],
                travel_time=result["estimatedTime"],
                navigation_status="COMPLETED",
            )
        )
        db.commit()

    return result


@router.get("/history")
def navigation_history(user: CurrentUser, db: DbSession, limit: int = 20) -> list[dict]:
    rows = (
        db.query(NavigationHistory)
        .filter(NavigationHistory.user_id == user.user_id)
        .order_by(NavigationHistory.navigation_date.desc())
        .limit(min(limit, 100))
        .all()
    )
    return [row.to_dict() for row in rows]
