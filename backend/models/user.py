"""
User models for VisionPath AI
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from database.config import Base
import enum


class AccessibilityMode(str, enum.Enum):
    VISUALLY_IMPAIRED = "visually-impaired"
    LOW_VISION = "low-vision"
    STANDARD = "standard"


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    accessibility_mode = Column(Enum(AccessibilityMode), default=AccessibilityMode.STANDARD, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    firebase_uid = Column(String, nullable=True, unique=True)
    preferences = relationship("UserPreferences", uselist=False, back_populates="user", cascade="all, delete-orphan")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "photo_url": self.photo_url,
            "role": self.role.value,
            "accessibility_mode": self.accessibility_mode.value,
            "preferences": self.preferences.to_dict() if self.preferences else {},
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    theme = Column(String, default="system", nullable=False)
    font_size = Column(String, default="normal", nullable=False)
    voice_speed = Column(String, default="1.0", nullable=False)
    language = Column(String, default="en", nullable=False)
    high_contrast = Column(Boolean, default=False, nullable=False)
    reduced_motion = Column(Boolean, default=False, nullable=False)
    screen_reader_optimized = Column(Boolean, default=False, nullable=False)
    voice_navigation = Column(Boolean, default=False, nullable=False)
    text_to_speech = Column(Boolean, default=False, nullable=False)
    voice_commands = Column(Boolean, default=False, nullable=False)
    large_touch_targets = Column(Boolean, default=False, nullable=False)
    audio_feedback = Column(Boolean, default=False, nullable=False)
    magnifier_ready = Column(Boolean, default=False, nullable=False)
    continuous_listening = Column(Boolean, default=False, nullable=False)
    notifications = relationship("NotificationPreference", uselist=False, back_populates="preferences", cascade="all, delete-orphan")

    user = relationship("User", back_populates="preferences")

    def to_dict(self):
        return {
            "theme": self.theme,
            "font_size": self.font_size,
            "voice_speed": self.voice_speed,
            "language": self.language,
            "high_contrast": self.high_contrast,
            "reduced_motion": self.reduced_motion,
            "screen_reader_optimized": self.screen_reader_optimized,
            "voice_navigation": self.voice_navigation,
            "text_to_speech": self.text_to_speech,
            "voice_commands": self.voice_commands,
            "large_touch_targets": self.large_touch_targets,
            "audio_feedback": self.audio_feedback,
            "magnifier_ready": self.magnifier_ready,
            "continuous_listening": self.continuous_listening,
            "notifications": self.notifications.to_dict() if self.notifications else {},
        }


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    preferences_id = Column(UUID(as_uuid=True), ForeignKey("user_preferences.id", ondelete="CASCADE"), nullable=False)
    push_enabled = Column(Boolean, default=True, nullable=False)
    email_enabled = Column(Boolean, default=True, nullable=False)
    class_reminders = Column(Boolean, default=True, nullable=False)
    event_alerts = Column(Boolean, default=True, nullable=False)
    emergency_alerts = Column(Boolean, default=True, nullable=False)
    navigation_reminders = Column(Boolean, default=True, nullable=False)

    preferences = relationship("UserPreferences", back_populates="notifications")

    def to_dict(self):
        return {
            "push_enabled": self.push_enabled,
            "email_enabled": self.email_enabled,
            "class_reminders": self.class_reminders,
            "event_alerts": self.event_alerts,
            "emergency_alerts": self.emergency_alerts,
            "navigation_reminders": self.navigation_reminders,
        }

