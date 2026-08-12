"""Auth request bodies. Secrets are always sent in the body, never the query string."""

from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

MIN_PASSWORD_LENGTH = 8


def _validate_password(value: str) -> str:
    if len(value) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
    if not any(char.islower() for char in value):
        raise ValueError("Password must contain a lowercase letter")
    if not any(char.isupper() for char in value):
        raise ValueError("Password must contain an uppercase letter")
    if not any(char.isdigit() for char in value):
        raise ValueError("Password must contain a number")
    return value


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    email: EmailStr
    password: str
    phoneNumber: Optional[str] = Field(default=None, max_length=32)

    _check_password = field_validator("password")(_validate_password)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1)
    newPassword: str

    _check_password = field_validator("newPassword")(_validate_password)


class ChangePasswordRequest(BaseModel):
    currentPassword: str = Field(min_length=1)
    newPassword: str

    _check_password = field_validator("newPassword")(_validate_password)


class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    expiresIn: int
    user: dict[str, Any]
