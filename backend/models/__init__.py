"""
Importing this package registers every SQLAlchemy mapper on the shared Base,
which is what makes `Base.metadata.create_all()` see the full schema.
"""

from .academic import ClassSchedule
from .emergency import EmergencyAlert, EmergencyContact
from .navigation import (
    Building,
    Direction,
    Edge,
    Floor,
    FloorMap,
    Location,
    LocationType,
    NavigationHistory,
    Node,
)
from .notification import Notification
from .user import Role, User, UserPreference

__all__ = [
    "Building",
    "ClassSchedule",
    "Direction",
    "Edge",
    "EmergencyAlert",
    "EmergencyContact",
    "Floor",
    "FloorMap",
    "Location",
    "LocationType",
    "NavigationHistory",
    "Node",
    "Notification",
    "Role",
    "User",
    "UserPreference",
]
