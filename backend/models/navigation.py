"""
Campus structure and the indoor navigation graph.

Two layers live here and they are joined, not duplicated:

  * The *place* layer — Building -> Floor -> Location. A Location is anything a
    user can be sent to: a room, an office, a washroom, a lift.
  * The *graph* layer — Node / Edge / Direction. Dijkstra runs over this.

`Location.node_id` is the bridge between them. Previously the frontend joined
these two worlds by string equality on names; the foreign key makes it explicit.
"""

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from database.config import Base

# Location types that represent a destination a person asks for by name.
ROOM_TYPES = ("room", "office", "lab", "library", "entrance")

# Location types rendered as "facilities" in the UI.
FACILITY_TYPES = (
    "washroom",
    "elevator",
    "stairs",
    "entrance",
    "exit",
    "water",
    "security",
    "medical",
    "cafeteria",
    "facility",
    "atm",
)

STATUS_ACTIVE = "ACTIVE"


class Building(Base):
    __tablename__ = "buildings"

    building_id = Column(Integer, primary_key=True, index=True)
    building_code = Column(String(32), nullable=False, unique=True, index=True)
    building_name = Column(String(128), nullable=False)
    address = Column(String(255))
    total_floors = Column(Integer, nullable=False, default=1)
    latitude = Column(Float, nullable=False, default=0.0)
    longitude = Column(Float, nullable=False, default=0.0)
    status = Column(String(16), nullable=False, default=STATUS_ACTIVE)

    floors = relationship(
        "Floor",
        back_populates="building",
        cascade="all, delete-orphan",
        order_by="Floor.floor_no",
    )

    def to_dict(self, include_floors: bool = True) -> dict:
        """Shaped to match the frontend `Building` type."""
        data = {
            "id": self.building_code,
            "buildingId": self.building_id,
            "name": self.building_name,
            "code": self.building_code,
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "totalFloors": self.total_floors,
        }
        if include_floors:
            data["floors"] = [floor.to_dict() for floor in self.floors]
        return data


class Floor(Base):
    __tablename__ = "floors"
    __table_args__ = (UniqueConstraint("building_id", "floor_no", name="uq_floor_per_building"),)

    floor_id = Column(Integer, primary_key=True, index=True)
    building_id = Column(
        Integer, ForeignKey("buildings.building_id", ondelete="CASCADE"), nullable=False
    )
    floor_no = Column(Integer, nullable=False)
    floor_name = Column(String(64), nullable=False)
    status = Column(String(16), nullable=False, default=STATUS_ACTIVE)

    building = relationship("Building", back_populates="floors")
    locations = relationship(
        "Location", back_populates="floor", cascade="all, delete-orphan"
    )
    floor_maps = relationship(
        "FloorMap", back_populates="floor", cascade="all, delete-orphan"
    )

    def to_dict(self) -> dict:
        """Shaped to match the frontend `Floor` type."""
        rooms = [
            location
            for location in self.locations
            if location.location_type
            and location.location_type.location_type in ROOM_TYPES
        ]
        facilities = [
            location
            for location in self.locations
            if location.location_type
            and location.location_type.location_type in FACILITY_TYPES
        ]
        active_map = next(
            (m for m in self.floor_maps if m.status == STATUS_ACTIVE), None
        )
        return {
            "id": f"floor-{self.floor_id}",
            "floorId": self.floor_id,
            "name": self.floor_name,
            "level": self.floor_no,
            "mapUrl": active_map.image_path if active_map else None,
            "rooms": [location.display_label for location in rooms],
            "facilities": [location.to_facility_dict() for location in facilities],
        }


class LocationType(Base):
    __tablename__ = "location_type"

    location_type_id = Column(Integer, primary_key=True, index=True)
    location_type = Column(String(32), nullable=False, unique=True)

    locations = relationship("Location", back_populates="location_type")

    def to_dict(self) -> dict:
        return {
            "locationTypeId": self.location_type_id,
            "locationType": self.location_type,
        }


class Location(Base):
    """A named place on a floor, optionally pinned to a graph node."""

    __tablename__ = "location"

    location_id = Column(Integer, primary_key=True, index=True)
    floor_id = Column(
        Integer, ForeignKey("floors.floor_id", ondelete="CASCADE"), nullable=False
    )
    node_id = Column(String(64), ForeignKey("node.node_id"), nullable=True, index=True)
    location_name = Column(String(128), nullable=False, index=True)
    display_name = Column(String(128))
    location_type_id = Column(
        Integer, ForeignKey("location_type.location_type_id"), nullable=False
    )
    is_searchable = Column(Boolean, nullable=False, default=True)
    status = Column(String(16), nullable=False, default=STATUS_ACTIVE)
    pos_x = Column(Integer, nullable=False, default=0)
    pos_y = Column(Integer, nullable=False, default=0)

    floor = relationship("Floor", back_populates="locations")
    location_type = relationship("LocationType", back_populates="locations")
    node = relationship("Node", back_populates="locations")

    @property
    def display_label(self) -> str:
        return self.display_name or self.location_name

    @property
    def type_name(self) -> str:
        return self.location_type.location_type if self.location_type else "facility"

    def to_dict(self) -> dict:
        """Shaped to match the frontend `NavigationDestination` type."""
        floor = self.floor
        building = floor.building if floor else None
        return {
            "id": str(self.location_id),
            "name": self.display_label,
            "nodeId": self.node_id,
            "building": building.building_name if building else "",
            "buildingCode": building.building_code if building else "",
            "floor": floor.floor_name if floor else "",
            "floorLevel": floor.floor_no if floor else 0,
            "type": self.type_name,
            "coordinates": {
                "x": self.pos_x,
                "y": self.pos_y,
                "floor": floor.floor_no if floor else 0,
            },
        }

    def to_facility_dict(self) -> dict:
        """Shaped to match the frontend `Facility` type."""
        floor = self.floor
        return {
            "id": str(self.location_id),
            "name": self.display_label,
            "nodeId": self.node_id,
            "type": self.type_name,
            "coordinates": {
                "x": self.pos_x,
                "y": self.pos_y,
                "floor": floor.floor_no if floor else 0,
            },
        }


class Node(Base):
    """A vertex of the routing graph: a room door, a corridor point, a junction."""

    __tablename__ = "node"

    node_id = Column(String(64), primary_key=True, index=True)
    node_name = Column(String(128), nullable=False)
    type = Column(String(32), nullable=False, default="junction")
    floor_id = Column(Integer, ForeignKey("floors.floor_id"), nullable=True)

    locations = relationship("Location", back_populates="node")

    def to_dict(self) -> dict:
        return {
            "nodeId": self.node_id,
            "name": self.node_name,
            "type": self.type,
            "floorId": self.floor_id,
        }


class Edge(Base):
    """A walkable connection. Stored once; treated as bidirectional by the router."""

    __tablename__ = "edge"
    __table_args__ = (
        UniqueConstraint("source_node_id", "destination_node_id", name="uq_edge_pair"),
    )

    edge_id = Column(Integer, primary_key=True, index=True)
    source_node_id = Column(
        String(64), ForeignKey("node.node_id", ondelete="CASCADE"), nullable=False, index=True
    )
    destination_node_id = Column(
        String(64), ForeignKey("node.node_id", ondelete="CASCADE"), nullable=False, index=True
    )
    distance = Column(Numeric(10, 2), nullable=False, default=1)
    status = Column(String(16), nullable=False, default=STATUS_ACTIVE)

    source_node = relationship("Node", foreign_keys=[source_node_id])
    destination_node = relationship("Node", foreign_keys=[destination_node_id])

    def to_dict(self) -> dict:
        return {
            "edgeId": self.edge_id,
            "from": self.source_node_id,
            "to": self.destination_node_id,
            "distance": float(self.distance) if self.distance is not None else 0.0,
            "status": self.status,
        }


class Direction(Base):
    """Spoken instruction for traversing one edge in one direction."""

    __tablename__ = "direction"
    __table_args__ = (
        UniqueConstraint(
            "source_node_id", "destination_node_id", name="uq_direction_pair"
        ),
    )

    direction_id = Column(Integer, primary_key=True, index=True)
    source_node_id = Column(
        String(64), ForeignKey("node.node_id", ondelete="CASCADE"), nullable=False, index=True
    )
    destination_node_id = Column(
        String(64), ForeignKey("node.node_id", ondelete="CASCADE"), nullable=False, index=True
    )
    instruction = Column(String(255), nullable=False)

    source_node = relationship("Node", foreign_keys=[source_node_id])
    destination_node = relationship("Node", foreign_keys=[destination_node_id])

    def to_dict(self) -> dict:
        return {
            "directionId": self.direction_id,
            "from": self.source_node_id,
            "to": self.destination_node_id,
            "instruction": self.instruction,
        }


class FloorMap(Base):
    __tablename__ = "floor_map"

    map_id = Column(Integer, primary_key=True, index=True)
    floor_id = Column(
        Integer, ForeignKey("floors.floor_id", ondelete="CASCADE"), nullable=False
    )
    image_path = Column(String(255), nullable=False)
    status = Column(String(16), nullable=False, default=STATUS_ACTIVE)
    uploaded_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    floor = relationship("Floor", back_populates="floor_maps")

    def to_dict(self) -> dict:
        return {
            "mapId": self.map_id,
            "floorId": self.floor_id,
            "imageUrl": self.image_path,
            "status": self.status,
            "uploadedAt": self.uploaded_at.isoformat() if self.uploaded_at else None,
        }


class NavigationHistory(Base):
    """One row per completed route request. Powers stats and recent locations."""

    __tablename__ = "navigation_history"

    history_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_node_id = Column(String(64), ForeignKey("node.node_id"), nullable=True)
    destination_node_id = Column(String(64), ForeignKey("node.node_id"), nullable=True)
    destination_location_id = Column(
        Integer, ForeignKey("location.location_id"), nullable=True
    )
    navigation_date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    travel_time = Column(Integer, nullable=False, default=0)
    distance = Column(Numeric(10, 2), nullable=False, default=0)
    navigation_status = Column(String(16), nullable=False, default="COMPLETED")

    user = relationship("User", back_populates="navigation_history")
    source_node = relationship("Node", foreign_keys=[source_node_id])
    destination_node = relationship("Node", foreign_keys=[destination_node_id])
    destination_location = relationship("Location", foreign_keys=[destination_location_id])

    def to_dict(self) -> dict:
        return {
            "id": str(self.history_id),
            "sourceNodeId": self.source_node_id,
            "destinationNodeId": self.destination_node_id,
            "navigationDate": self.navigation_date.isoformat()
            if self.navigation_date
            else None,
            "travelTime": self.travel_time,
            "distance": float(self.distance) if self.distance is not None else 0.0,
            "status": self.navigation_status,
        }
