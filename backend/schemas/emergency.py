"""Emergency request bodies."""

from typing import Literal, Optional

from pydantic import BaseModel, Field

AlertType = Literal["sos", "medical", "security", "fire"]


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    phone: str = Field(min_length=3, max_length=32)
    relationship: str = Field(default="Contact", max_length=64)
    isPrimary: bool = False


class SOSRequest(BaseModel):
    type: AlertType = "sos"
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    accuracy: Optional[float] = Field(default=None, ge=0)
    building: Optional[str] = Field(default=None, max_length=128)
    floor: Optional[str] = Field(default=None, max_length=64)
    message: Optional[str] = Field(default=None, max_length=500)
