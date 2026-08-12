"""User profile and accessibility preference request bodies."""

from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field

AccessibilityMode = Literal["visually-impaired", "low-vision", "standard"]
ThemeName = Literal["light", "dark", "system"]
FontSize = Literal["normal", "large", "x-large"]


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=128)
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = Field(default=None, max_length=32)
    accessibilityMode: Optional[AccessibilityMode] = None


class UpdateModeRequest(BaseModel):
    accessibilityMode: AccessibilityMode


class PreferencesRequest(BaseModel):
    """Every field optional — this is a patch, applied over the stored row."""

    theme: Optional[ThemeName] = None
    fontSize: Optional[FontSize] = None
    voiceSpeed: Optional[float] = Field(default=None, ge=0.5, le=2.0)
    language: Optional[str] = Field(default=None, max_length=16)
    highContrast: Optional[bool] = None
    reducedMotion: Optional[bool] = None
    screenReaderOptimized: Optional[bool] = None
    voiceNavigation: Optional[bool] = None
    textToSpeech: Optional[bool] = None
    voiceCommands: Optional[bool] = None
    largeTouchTargets: Optional[bool] = None
    audioFeedback: Optional[bool] = None
    magnifierReady: Optional[bool] = None
    continuousListening: Optional[bool] = None
    emailNotifications: Optional[bool] = None
    pushNotifications: Optional[bool] = None
