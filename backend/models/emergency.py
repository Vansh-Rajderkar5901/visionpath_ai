"""Emergency contacts and SOS alerts."""

from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
)
from sqlalchemy.orm import relationship

from database.config import Base

ALERT_TYPES = ("sos", "medical", "security", "fire")
ALERT_ACTIVE = "active"
ALERT_RESOLVED = "resolved"


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    contact_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True
    )
    name = Column(String(128), nullable=False)
    phone = Column(String(32), nullable=False)
    # Named `relation` in Python: `relationship` would shadow the SQLAlchemy
    # helper imported above and break the mapper below.
    relation = Column("relationship", String(64), nullable=False, default="Contact")
    is_primary = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User", back_populates="emergency_contacts")

    def to_dict(self) -> dict:
        return {
            "id": str(self.contact_id),
            "name": self.name,
            "phone": self.phone,
            "relationship": self.relation,
            "isPrimary": self.is_primary,
            "isActive": self.is_active,
        }


class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    alert_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True
    )
    alert_type = Column(String(16), nullable=False, default="sos")
    latitude = Column(Float)
    longitude = Column(Float)
    accuracy = Column(Float)
    building = Column(String(128))
    floor = Column(String(64))
    message = Column(String(500))
    status = Column(String(16), nullable=False, default=ALERT_ACTIVE, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime)

    user = relationship("User")

    def to_dict(self) -> dict:
        return {
            "id": str(self.alert_id),
            "userId": str(self.user_id),
            "userName": self.user.display_name if self.user else None,
            "type": self.alert_type,
            "location": {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "accuracy": self.accuracy,
                "building": self.building,
                "floor": self.floor,
            },
            "status": self.status,
            "message": self.message,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "resolvedAt": self.resolved_at.isoformat() if self.resolved_at else None,
        }
