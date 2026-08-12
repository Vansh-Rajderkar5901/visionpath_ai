"""
Seed the database with the CSE Block campus data and an administrator account.

    cd backend
    python seed.py            # insert anything missing, leave existing rows alone
    python seed.py --reset    # drop every table first, then re-seed

The campus graph below is the data that used to be hard-coded in the frontend
(src/navigation/graph.ts, direction.ts and services/navigation.ts). Postgres is
now the only place it lives.
"""

import argparse
import sys
from datetime import time

from sqlalchemy.orm import Session

from core.config import settings
from database.config import Base, SessionLocal, check_db_connection, engine
from models.academic import ClassSchedule
from models.navigation import (
    Building,
    Direction,
    Edge,
    Floor,
    Location,
    LocationType,
    Node,
)
from models.user import ROLE_ADMIN, ROLE_USER, Role, User
from services.auth_service import AuthService

# --------------------------------------------------------------------------
# Campus data
# --------------------------------------------------------------------------

BUILDING = {
    "code": "CSE",
    "name": "CSE Block",
    "address": "Computer Science & Engineering Department",
    "latitude": 21.1458,
    "longitude": 79.0882,
    "total_floors": 1,
}

FLOOR = {"floor_no": 2, "floor_name": "Second Floor"}

LOCATION_TYPES = (
    "room",
    "office",
    "lab",
    "library",
    "entrance",
    "washroom",
    "elevator",
    "stairs",
    "exit",
    "water",
    "security",
    "medical",
    "cafeteria",
    "facility",
    "atm",
)

# node_id -> (human name, node type)
NODES: dict[str, tuple[str, str]] = {
    "Seminar_Hall": ("Seminar Hall", "room"),
    "Seminar_Junction": ("Seminar Junction", "junction"),
    "North_Corridor": ("North Corridor", "corridor"),
    "BS19": ("BS-19", "room"),
    "BS18_Corridor": ("BS-18 Corridor", "corridor"),
    "BS18A": ("BS-18A", "room"),
    "BS18B": ("BS-18B", "room"),
    "BS17_Corridor": ("BS-17 Corridor", "corridor"),
    "BS17A": ("BS-17A", "room"),
    "BS17B": ("BS-17B", "room"),
    "BS17C": ("BS-17C", "room"),
    "BS17D": ("BS-17D", "room"),
    "Courtyard_Junction": ("Courtyard Junction", "junction"),
    "Lift_Stair_Junction": ("Lift and Stair Junction", "junction"),
    "Lift_Area": ("Lift Area", "elevator"),
    "Stair_Area": ("Stair Area", "stairs"),
    "Water_Dispenser": ("Water Dispenser", "water"),
    "Faculty_Junction": ("Faculty Junction", "junction"),
    "Faculty_Room": ("Faculty Room", "office"),
    "Meeting_Room": ("Meeting Room", "office"),
    "Classroom_Junction": ("Classroom Junction", "junction"),
    "BS05": ("BS-05", "room"),
    "BS07": ("BS-07", "room"),
    "Toilet": ("Toilet", "washroom"),
}

# (from, to, metres) — stored once, walked in both directions.
EDGES: list[tuple[str, str, float]] = [
    ("Seminar_Hall", "Seminar_Junction", 2),
    ("Seminar_Junction", "North_Corridor", 4),
    ("North_Corridor", "BS19", 3),
    ("North_Corridor", "BS18_Corridor", 5),
    ("BS18_Corridor", "BS18A", 2),
    ("BS18_Corridor", "BS18B", 2),
    ("BS18_Corridor", "BS17_Corridor", 6),
    ("BS17_Corridor", "BS17A", 2),
    ("BS17_Corridor", "BS17B", 2),
    ("BS17_Corridor", "BS17C", 2),
    ("BS17_Corridor", "BS17D", 3),
    ("BS17_Corridor", "Courtyard_Junction", 8),
    ("Courtyard_Junction", "Lift_Stair_Junction", 6),
    ("Lift_Stair_Junction", "Lift_Area", 2),
    ("Lift_Stair_Junction", "Stair_Area", 2),
    ("Lift_Stair_Junction", "Water_Dispenser", 1),
    ("Lift_Stair_Junction", "Faculty_Junction", 5),
    ("Faculty_Junction", "Faculty_Room", 2),
    ("Faculty_Junction", "Meeting_Room", 3),
    ("Faculty_Junction", "Classroom_Junction", 6),
    ("Classroom_Junction", "BS05", 2),
    ("Classroom_Junction", "BS07", 2),
    ("Classroom_Junction", "Toilet", 2),
]

# Spoken guidance per traversal. Both orientations are authored so a route is
# never left with a generated fallback on this floor.
DIRECTIONS: list[tuple[str, str, str]] = [
    # --- spine, outbound (from the lift towards the seminar hall) ---
    ("Lift_Area", "Lift_Stair_Junction", "Leave the lift area and walk to the lift and stair junction."),
    ("Lift_Stair_Junction", "Courtyard_Junction", "Walk straight towards the courtyard."),
    ("Courtyard_Junction", "BS17_Corridor", "Continue straight into the BS-17 corridor."),
    ("BS17_Corridor", "BS18_Corridor", "Walk straight until the BS-18 corridor."),
    ("BS18_Corridor", "North_Corridor", "Walk straight into the north corridor."),
    ("North_Corridor", "Seminar_Junction", "Continue straight to the seminar junction."),
    ("Seminar_Junction", "Seminar_Hall", "The seminar hall is straight ahead."),
    # --- spine, return ---
    ("Seminar_Hall", "Seminar_Junction", "Leave the seminar hall and walk to the junction."),
    ("Seminar_Junction", "North_Corridor", "Walk straight into the north corridor."),
    ("North_Corridor", "BS18_Corridor", "Continue straight to the BS-18 corridor."),
    ("BS18_Corridor", "BS17_Corridor", "Walk straight until the BS-17 corridor."),
    ("BS17_Corridor", "Courtyard_Junction", "Continue straight towards the courtyard."),
    ("Courtyard_Junction", "Lift_Stair_Junction", "Walk straight to the lift and stair junction."),
    ("Lift_Stair_Junction", "Lift_Area", "The lift area is just ahead."),
    # --- lift and stair cluster ---
    ("Lift_Stair_Junction", "Stair_Area", "The staircase is just ahead."),
    ("Stair_Area", "Lift_Stair_Junction", "Leave the staircase and return to the junction."),
    ("Lift_Stair_Junction", "Water_Dispenser", "The water dispenser is one step to your side."),
    ("Water_Dispenser", "Lift_Stair_Junction", "Turn back to the lift and stair junction."),
    ("Lift_Stair_Junction", "Faculty_Junction", "Walk straight towards the faculty junction."),
    ("Faculty_Junction", "Lift_Stair_Junction", "Walk straight back to the lift and stair junction."),
    # --- faculty wing ---
    ("Faculty_Junction", "Faculty_Room", "Turn left. The faculty room is ahead."),
    ("Faculty_Room", "Faculty_Junction", "Leave the faculty room and turn right to the junction."),
    ("Faculty_Junction", "Meeting_Room", "Turn right. The meeting room is ahead."),
    ("Meeting_Room", "Faculty_Junction", "Leave the meeting room and turn left to the junction."),
    ("Faculty_Junction", "Classroom_Junction", "Walk straight towards the classrooms."),
    ("Classroom_Junction", "Faculty_Junction", "Walk straight back to the faculty junction."),
    # --- classroom cluster ---
    ("Classroom_Junction", "BS05", "Turn left. BS-05 is ahead."),
    ("BS05", "Classroom_Junction", "Leave BS-05 and turn right to the junction."),
    ("Classroom_Junction", "BS07", "Turn right. BS-07 is ahead."),
    ("BS07", "Classroom_Junction", "Leave BS-07 and turn left to the junction."),
    ("Classroom_Junction", "Toilet", "Walk straight. The toilet is ahead."),
    ("Toilet", "Classroom_Junction", "Leave the toilet and walk back to the junction."),
    # --- BS-17 cluster ---
    ("BS17_Corridor", "BS17A", "BS-17A is on your left."),
    ("BS17A", "BS17_Corridor", "Leave BS-17A and step back into the corridor."),
    ("BS17_Corridor", "BS17B", "BS-17B is next to BS-17A."),
    ("BS17B", "BS17_Corridor", "Leave BS-17B and step back into the corridor."),
    ("BS17_Corridor", "BS17C", "Continue straight to BS-17C."),
    ("BS17C", "BS17_Corridor", "Leave BS-17C and step back into the corridor."),
    ("BS17_Corridor", "BS17D", "BS-17D is at the end of the corridor."),
    ("BS17D", "BS17_Corridor", "Leave BS-17D and walk back along the corridor."),
    # --- BS-18 cluster ---
    ("BS18_Corridor", "BS18A", "Turn left. BS-18A is on your left."),
    ("BS18A", "BS18_Corridor", "Leave BS-18A and turn right into the corridor."),
    ("BS18_Corridor", "BS18B", "Turn right. BS-18B is on your right."),
    ("BS18B", "BS18_Corridor", "Leave BS-18B and turn left into the corridor."),
    # --- north corridor ---
    ("North_Corridor", "BS19", "BS-19 is on your left."),
    ("BS19", "North_Corridor", "Leave BS-19 and step back into the north corridor."),
]

# (display name, node id, location type, x, y)
LOCATIONS: list[tuple[str, str, str, int, int]] = [
    ("Seminar Hall", "Seminar_Hall", "room", 100, 100),
    ("BS-19", "BS19", "room", 120, 120),
    ("BS-18A", "BS18A", "room", 140, 140),
    ("BS-18B", "BS18B", "room", 160, 160),
    ("BS-17A", "BS17A", "room", 180, 180),
    ("BS-17B", "BS17B", "room", 200, 200),
    ("BS-17C", "BS17C", "room", 220, 220),
    ("BS-17D", "BS17D", "room", 240, 240),
    ("Faculty Room", "Faculty_Room", "office", 260, 260),
    ("Meeting Room", "Meeting_Room", "office", 280, 280),
    ("BS-05", "BS05", "room", 300, 300),
    ("BS-07", "BS07", "room", 320, 320),
    ("Lift Area", "Lift_Area", "elevator", 500, 300),
    ("Stair Area", "Stair_Area", "stairs", 550, 300),
    ("Water Dispenser", "Water_Dispenser", "water", 600, 300),
    ("Toilet", "Toilet", "washroom", 750, 520),
]

# (course, instructor, room node id, day, start, end)
CLASSES: list[tuple[str, str, str, str, time, time]] = [
    ("Data Structures", "Dr. S. Deshmukh", "BS17A", "Monday", time(9, 0), time(10, 30)),
    ("Operating Systems", "Prof. A. Kulkarni", "BS18A", "Tuesday", time(11, 0), time(12, 30)),
    ("Database Systems", "Dr. R. Iyer", "BS05", "Wednesday", time(14, 0), time(15, 30)),
    ("Computer Networks", "Prof. M. Nair", "BS07", "Thursday", time(10, 0), time(11, 30)),
    ("Project Review", "Dr. S. Deshmukh", "Seminar_Hall", "Friday", time(15, 0), time(17, 0)),
]


# --------------------------------------------------------------------------
# Seeding
# --------------------------------------------------------------------------


def seed_roles(db: Session) -> None:
    wanted = {
        ROLE_ADMIN: ("ADMIN", "Full platform administration"),
        ROLE_USER: ("USER", "Standard application user"),
    }
    for role_id, (name, description) in wanted.items():
        if db.get(Role, role_id) is None:
            db.add(Role(role_id=role_id, role_name=name, description=description))
    db.flush()


def seed_location_types(db: Session) -> dict[str, LocationType]:
    existing = {row.location_type: row for row in db.query(LocationType).all()}
    for name in LOCATION_TYPES:
        if name not in existing:
            row = LocationType(location_type=name)
            db.add(row)
            existing[name] = row
    db.flush()
    return existing


def seed_campus(db: Session) -> tuple[Building, Floor]:
    building = (
        db.query(Building).filter(Building.building_code == BUILDING["code"]).first()
    )
    if building is None:
        building = Building(
            building_code=BUILDING["code"],
            building_name=BUILDING["name"],
            address=BUILDING["address"],
            latitude=BUILDING["latitude"],
            longitude=BUILDING["longitude"],
            total_floors=BUILDING["total_floors"],
        )
        db.add(building)
        db.flush()

    floor = (
        db.query(Floor)
        .filter(
            Floor.building_id == building.building_id,
            Floor.floor_no == FLOOR["floor_no"],
        )
        .first()
    )
    if floor is None:
        floor = Floor(
            building_id=building.building_id,
            floor_no=FLOOR["floor_no"],
            floor_name=FLOOR["floor_name"],
        )
        db.add(floor)
        db.flush()

    return building, floor


def seed_graph(db: Session, floor: Floor) -> None:
    for node_id, (name, node_type) in NODES.items():
        if db.get(Node, node_id) is None:
            db.add(
                Node(
                    node_id=node_id,
                    node_name=name,
                    type=node_type,
                    floor_id=floor.floor_id,
                )
            )
    db.flush()

    existing_edges = {
        (edge.source_node_id, edge.destination_node_id)
        for edge in db.query(Edge).all()
    }
    for source, target, distance in EDGES:
        if (source, target) in existing_edges or (target, source) in existing_edges:
            continue
        db.add(Edge(source_node_id=source, destination_node_id=target, distance=distance))
    db.flush()

    existing_directions = {
        (row.source_node_id, row.destination_node_id)
        for row in db.query(Direction).all()
    }
    for source, target, instruction in DIRECTIONS:
        if (source, target) in existing_directions:
            continue
        db.add(
            Direction(
                source_node_id=source,
                destination_node_id=target,
                instruction=instruction,
            )
        )
    db.flush()


def seed_locations(db: Session, floor: Floor, types: dict[str, LocationType]) -> None:
    existing = {
        row.location_name
        for row in db.query(Location).filter(Location.floor_id == floor.floor_id).all()
    }
    for name, node_id, type_name, pos_x, pos_y in LOCATIONS:
        if name in existing:
            continue
        db.add(
            Location(
                floor_id=floor.floor_id,
                node_id=node_id,
                location_name=name,
                display_name=name,
                location_type_id=types[type_name].location_type_id,
                pos_x=pos_x,
                pos_y=pos_y,
            )
        )
    db.flush()


def seed_classes(db: Session) -> None:
    if db.query(ClassSchedule).count() > 0:
        return

    by_node = {
        location.node_id: location
        for location in db.query(Location).filter(Location.node_id.isnot(None)).all()
    }
    for course, instructor, node_id, day, start, end in CLASSES:
        location = by_node.get(node_id)
        db.add(
            ClassSchedule(
                course_name=course,
                instructor=instructor,
                location_id=location.location_id if location else None,
                day_of_week=day,
                start_time=start,
                end_time=end,
            )
        )
    db.flush()


def seed_admin(db: Session) -> str:
    service = AuthService(db)
    existing = service.get_by_email(settings.seed_admin_email)
    if existing:
        if existing.role_id != ROLE_ADMIN:
            existing.role_id = ROLE_ADMIN
            db.commit()
        return f"Administrator already present: {existing.email}"

    service.create_user(
        name="Platform Administrator",
        email=settings.seed_admin_email,
        password=settings.seed_admin_password,
        role_id=ROLE_ADMIN,
    )
    return (
        f"Administrator created: {settings.seed_admin_email} "
        f"(password from SEED_ADMIN_PASSWORD)"
    )


def run(reset: bool = False) -> int:
    if not check_db_connection():
        print("ERROR: cannot connect to PostgreSQL.", file=sys.stderr)
        print(
            "  Check DATABASE_URL in backend/.env and that the server is running.",
            file=sys.stderr,
        )
        return 1

    import models  # noqa: F401  (registers every mapper before create_all)

    if reset:
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)

    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_roles(db)
        types = seed_location_types(db)
        _, floor = seed_campus(db)
        seed_graph(db, floor)
        seed_locations(db, floor, types)
        seed_classes(db)
        db.commit()

        admin_message = seed_admin(db)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print("Seed complete.")
    print(f"  Nodes:      {len(NODES)}")
    print(f"  Edges:      {len(EDGES)} (bidirectional)")
    print(f"  Directions: {len(DIRECTIONS)}")
    print(f"  Locations:  {len(LOCATIONS)}")
    print(f"  Classes:    {len(CLASSES)}")
    print(f"  {admin_message}")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the VisionPath AI database.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Drop every table before seeding. Destroys all existing data.",
    )
    args = parser.parse_args()
    raise SystemExit(run(reset=args.reset))
