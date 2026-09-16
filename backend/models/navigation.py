"""
Navigation models for buildings, floors, and facilities
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from database.config import Base
import enum


class FacilityType(str, enum.Enum):
    WASHROOM = "washroom"
    ELEVATOR = "elevator"
    STAIRS = "stairs"
    ENTRANCE = "entrance"
    EXIT = "exit"
    WATER = "water"
    SECURITY = "security"
    MEDICAL = "medical"
    CAFETERIA = "cafeteria"


class DestinationType(str, enum.Enum):
    ROOM = "room"
    FACILITY = "facility"
    OFFICE = "office"
    LAB = "lab"
    LIBRARY = "library"
    ENTRANCE = "entrance"


class Building(Base):
    __tablename__ = "buildings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False, unique=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan", order_by="Floor.level")

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "code": self.code,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "image_url": self.image_url,
            "floors": [floor.to_dict() for floor in self.floors],
            "created_at": self.created_at.isoformat(),
        }


class Floor(Base):
    __tablename__ = "floors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    building_id = Column(UUID(as_uuid=True), ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    level = Column(Integer, nullable=False)
    map_url = Column(String, nullable=True)

    building = relationship("Building", back_populates="floors")
    facilities = relationship("Facility", back_populates="floor", cascade="all, delete-orphan")
    rooms = Column(JSON, default=list)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "level": self.level,
            "map_url": self.map_url,
            "rooms": self.rooms or [],
            "facilities": [fac.to_dict() for fac in self.facilities],
        }


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    floor_id = Column(UUID(as_uuid=True), ForeignKey("floors.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum(FacilityType), nullable=False)
    coordinates = Column(JSON, nullable=False)

    floor = relationship("Floor", back_populates="facilities")

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "type": self.type.value,
            "coordinates": self.coordinates,
        }


class NavigationDestination(Base):
    __tablename__ = "navigation_destinations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    building_id = Column(UUID(as_uuid=True), ForeignKey("buildings.id"), nullable=False)
    floor_id = Column(UUID(as_uuid=True), ForeignKey("floors.id"), nullable=False)
    coordinates = Column(JSON, nullable=False)
    type = Column(Enum(DestinationType), nullable=False)
    is_active = Column(Boolean, default=True)

    building = relationship("Building")
    floor = relationship("Floor")

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "building": self.building.name if self.building else "",
            "floor": self.floor.name if self.floor else "",
            "coordinates": self.coordinates,
            "type": self.type.value,
        }


class NavigationHistory(Base):
    __tablename__ = "navigation_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    source = Column(String, nullable=True)
    destination_id = Column(UUID(as_uuid=True), ForeignKey("navigation_destinations.id"), nullable=False)
    completed = Column(Boolean, default=False)
    duration_seconds = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    destination = relationship("NavigationDestination")

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "source": self.source,
            "destination": self.destination.name if self.destination else "",
            "completed": self.completed,
            "duration_seconds": self.duration_seconds,
            "created_at": self.created_at.isoformat(),
        }

