"""Admin request bodies."""

from typing import Literal, Optional

from pydantic import BaseModel, Field

NotificationType = Literal["class", "event", "emergency", "navigation", "system"]


class UpdateUserRequest(BaseModel):
    role: Optional[Literal["admin", "user"]] = None
    accountStatus: Optional[Literal["ACTIVE", "SUSPENDED"]] = None


class BroadcastRequest(BaseModel):
    title: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=500)
    type: NotificationType = "system"
    actionUrl: Optional[str] = Field(default=None, max_length=255)
