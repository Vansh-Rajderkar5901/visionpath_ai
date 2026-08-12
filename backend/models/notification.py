"""In-app notifications."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database.config import Base

NOTIFICATION_TYPES = ("class", "event", "emergency", "navigation", "system")


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True
    )
    notification_type = Column(String(16), nullable=False, default="system")
    title = Column(String(128), nullable=False)
    message = Column(String(500), nullable=False)
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    action_url = Column(String(255))
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="notifications")

    def to_dict(self) -> dict:
        return {
            "id": str(self.notification_id),
            "type": self.notification_type,
            "title": self.title,
            "message": self.message,
            "read": self.is_read,
            "actionUrl": self.action_url,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
