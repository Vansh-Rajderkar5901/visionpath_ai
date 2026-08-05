"""
    Navigation models for buildings, floors, and facilities
    """

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import relationship
from database.config import Base
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID


class Building(Base):
        __tablename__ = "buildings"

        building_id = Column(Integer, primary_key=True, index=True)
        building_name = Column(String, nullable=False)
        address = Column(String)
        total_floors = Column(Integer)

        floors = relationship("Floor", back_populates="building")

        def to_dict(self):
            return {
                "building_id": self.building_id,
                "building_name": self.building_name,
                "address": self.address,
                "total_floors": self.total_floors,
            }


class Floor(Base):
        __tablename__ = "floors"

        floor_id = Column(Integer, primary_key=True, index=True)
        building_id = Column(Integer, ForeignKey("buildings.building_id"))
        floor_no = Column(Integer)
        floor_name = Column(String)
        status = Column(String)

        building = relationship("Building", back_populates="floors")
        locations = relationship("Location", back_populates="floor")
        floor_maps = relationship("FloorMap", back_populates="floor")

        def to_dict(self):
            return {
                "floor_id": self.floor_id,
                "building_id": self.building_id,
                "floor_no": self.floor_no,
                "floor_name": self.floor_name,
                "status": self.status,
            }

class Location(Base):
     __tablename__ = "location"

     location_id = Column(Integer, primary_key=True, index=True)
     floor_id = Column(Integer, ForeignKey("floors.floor_id"))
     location_name = Column(String, nullable=False)
     display_name = Column(String)
     location_type_id = Column(Integer, ForeignKey("location_type.location_type_id"))
     is_searchable = Column(Boolean, default=True)
     status = Column(String)

     floor = relationship("Floor", back_populates="locations")
     location_type = relationship("LocationType", back_populates="locations")

     def to_dict(self):
        return {
            "location_id": self.location_id,
            "floor_id": self.floor_id,
            "location_name": self.location_name,
            "display_name": self.display_name,
            "location_type_id": self.location_type_id,
            "is_searchable": self.is_searchable,
            "status": self.status,
        }

class LocationType(Base):
        __tablename__ = "location_type"

        location_type_id = Column(Integer, primary_key=True, index=True)
        location_type = Column(String, nullable=False)
        locations = relationship("Location", back_populates="location_type")

        def to_dict(self):
            return {
                "location_type_id": self.location_type_id,
                "location_type": self.location_type,
            }

class Node(Base):
        __tablename__ = "node"

        node_id = Column(String, primary_key=True, index=True)
        node_name = Column(String, nullable=False)
        type = Column(String, nullable=False)

        def to_dict(self):
            return {
                "node_id": self.node_id,
                "node_name": self.node_name,
                "type": self.type,
            }

class Edge(Base):
        __tablename__ = "edge"

        edge_id = Column(Integer, primary_key=True, index=True)
        source_node_id = Column(String, ForeignKey("node.node_id"))
        destination_node_id = Column(String, ForeignKey("node.node_id"))
        distance = Column(Numeric(10,2))
        status = Column(String)

        source_node = relationship("Node", foreign_keys=[source_node_id])
        destination_node = relationship("Node", foreign_keys=[destination_node_id])

        def to_dict(self):
            return {
                "edge_id": self.edge_id,
                "source_node_id": self.source_node_id,
                "destination_node_id": self.destination_node_id,
                "distance": float(self.distance) if self.distance else 0,
                "status": self.status,
            }

class Direction(Base):
        __tablename__ = "direction"

        direction_id = Column(Integer, primary_key=True, index=True)
        source_node_id = Column(String, ForeignKey("node.node_id"))
        destination_node_id = Column(String, ForeignKey("node.node_id"))
        instruction = Column(String, nullable=False)

        source_node = relationship("Node", foreign_keys=[source_node_id])
        destination_node = relationship("Node", foreign_keys=[destination_node_id])

        def to_dict(self):
            return {
                "direction_id": self.direction_id,
                "source_node_id": self.source_node_id,
                "destination_node_id": self.destination_node_id,
                "instruction": self.instruction,
            }

class FloorMap(Base):
        __tablename__ = "floor_map"

        map_id = Column(Integer, primary_key=True, index=True)
        floor_id = Column(Integer, ForeignKey("floors.floor_id"))
        image_path = Column(String, nullable=False)
        status = Column(String)

        floor = relationship("Floor", back_populates="floor_maps")

        def to_dict(self):
            return {
                "map_id": self.map_id,
                "floor_id": self.floor_id,
                "image_path": self.image_path,
                "status": self.status,
            }


class NavigationHistory(Base):
        __tablename__ = "navigation_history"

        history_id = Column(Integer, primary_key=True, index=True)
        user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
        source_location_id = Column(Integer, ForeignKey("location.location_id"))
        destination_location_id = Column(Integer, ForeignKey("location.location_id"))
        navigation_date = Column(DateTime, default=datetime.utcnow)
        travel_time = Column(Integer)
        distance = Column(Numeric(10,2))
        navigation_status = Column(String)

        source_location = relationship(
            "Location",
            foreign_keys=[source_location_id]
        )

        destination_location = relationship(
            "Location",
            foreign_keys=[destination_location_id]
        )

        def to_dict(self):
            return {
                "history_id": self.history_id,
                "user_id": self.user_id,
                "source_location_id": self.source_location_id,
                "destination_location_id": self.destination_location_id,
                "navigation_date": self.navigation_date.isoformat()
                 if self.navigation_date else None,
                "travel_time": self.travel_time,
                "distance": float(self.distance) if self.distance else 0,
                "navigation_status": self.navigation_status,
            }

