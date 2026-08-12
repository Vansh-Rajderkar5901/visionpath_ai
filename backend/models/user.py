"""User, Role, and per-user accessibility preferences."""

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

# Role ids are fixed so the seed script and the authorization checks agree.
ROLE_ADMIN = 1
ROLE_USER = 2

ACCESSIBILITY_MODES = ("visually-impaired", "low-vision", "standard")
DEFAULT_ACCESSIBILITY_MODE = "standard"

ACCOUNT_ACTIVE = "ACTIVE"
ACCOUNT_SUSPENDED = "SUSPENDED"


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(32), nullable=False, unique=True)
    description = Column(String(255))

    users = relationship("User", back_populates="role")

    def to_dict(self) -> dict:
        return {
            "roleId": self.role_id,
            "roleName": self.role_name,
            "description": self.description,
        }


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), nullable=False, unique=True, index=True)
    full_name = Column(String(128))
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone_number = Column(String(32))
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False, default=ROLE_USER)
    is_visually_impaired = Column(Boolean, nullable=False, default=False)
    accessibility_mode = Column(
        String(32), nullable=False, default=DEFAULT_ACCESSIBILITY_MODE
    )
    account_status = Column(String(16), nullable=False, default=ACCOUNT_ACTIVE)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    last_login = Column(DateTime)

    role = relationship("Role", back_populates="users")
    preferences = relationship(
        "UserPreference",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    emergency_contacts = relationship(
        "EmergencyContact", back_populates="user", cascade="all, delete-orphan"
    )
    notifications = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
    navigation_history = relationship(
        "NavigationHistory", back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def role_name(self) -> str:
        return "admin" if self.role_id == ROLE_ADMIN else "user"

    @property
    def display_name(self) -> str:
        return self.full_name or self.username

    def to_dict(self) -> dict:
        """Shaped to match the frontend `User` type (camelCase)."""
        prefs = self.preferences or UserPreference()
        return {
            "id": str(self.user_id),
            "email": self.email,
            "name": self.display_name,
            "username": self.username,
            "phoneNumber": self.phone_number,
            "photoURL": "",
            "role": self.role_name,
            "accessibilityMode": self.accessibility_mode,
            "accountStatus": self.account_status,
            "preferences": prefs.to_dict(),
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
            "lastLogin": self.last_login.isoformat() if self.last_login else None,
        }


class UserPreference(Base):
    """One row per user. Mirrors the frontend `UserPreferences` interface."""

    __tablename__ = "user_preferences"

    preference_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )

    theme = Column(String(16), nullable=False, default="system")
    font_size = Column(String(16), nullable=False, default="normal")
    voice_speed = Column(Float, nullable=False, default=1.0)
    language = Column(String(16), nullable=False, default="en")

    high_contrast = Column(Boolean, nullable=False, default=False)
    reduced_motion = Column(Boolean, nullable=False, default=False)
    screen_reader_optimized = Column(Boolean, nullable=False, default=False)
    voice_navigation = Column(Boolean, nullable=False, default=False)
    text_to_speech = Column(Boolean, nullable=False, default=False)
    voice_commands = Column(Boolean, nullable=False, default=False)
    large_touch_targets = Column(Boolean, nullable=False, default=False)
    audio_feedback = Column(Boolean, nullable=False, default=False)
    magnifier_ready = Column(Boolean, nullable=False, default=False)
    continuous_listening = Column(Boolean, nullable=False, default=False)

    email_notifications = Column(Boolean, nullable=False, default=True)
    push_notifications = Column(Boolean, nullable=False, default=True)

    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user = relationship("User", back_populates="preferences")

    # Maps the frontend camelCase key -> this model's column name.
    FIELD_MAP = {
        "theme": "theme",
        "fontSize": "font_size",
        "voiceSpeed": "voice_speed",
        "language": "language",
        "highContrast": "high_contrast",
        "reducedMotion": "reduced_motion",
        "screenReaderOptimized": "screen_reader_optimized",
        "voiceNavigation": "voice_navigation",
        "textToSpeech": "text_to_speech",
        "voiceCommands": "voice_commands",
        "largeTouchTargets": "large_touch_targets",
        "audioFeedback": "audio_feedback",
        "magnifierReady": "magnifier_ready",
        "continuousListening": "continuous_listening",
        "emailNotifications": "email_notifications",
        "pushNotifications": "push_notifications",
    }

    def apply(self, patch: dict) -> None:
        """Apply a camelCase patch from the client, ignoring unknown keys."""
        for key, value in patch.items():
            column = self.FIELD_MAP.get(key)
            if column is not None and value is not None:
                setattr(self, column, value)

    def to_dict(self) -> dict:
        return {
            camel: getattr(self, column)
            for camel, column in self.FIELD_MAP.items()
        }
