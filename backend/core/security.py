"""
Password hashing and JWT helpers.

bcrypt is used directly (rather than through passlib) because passlib 1.7.x
is unmaintained and breaks against modern bcrypt releases.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import bcrypt
import jwt

from core.config import settings

# bcrypt refuses inputs longer than 72 bytes; hash a truncated view so long
# passwords degrade predictably instead of raising.
_BCRYPT_MAX_BYTES = 72

TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_RESET = "reset"


def _prepare(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_prepare(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, password_hash: Optional[str]) -> bool:
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(_prepare(plain_password), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_token(
    subject: str | int,
    token_type: str = TOKEN_TYPE_ACCESS,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict[str, Any]] = None,
) -> str:
    """Create a signed JWT. `subject` is always stored as a string per RFC 7519."""
    if expires_delta is None:
        minutes = (
            settings.reset_token_expire_minutes
            if token_type == TOKEN_TYPE_RESET
            else settings.access_token_expire_minutes
        )
        expires_delta = timedelta(minutes=minutes)

    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str, expected_type: str = TOKEN_TYPE_ACCESS) -> Optional[dict[str, Any]]:
    """Return the token payload, or None if it is invalid, expired, or the wrong type."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except jwt.PyJWTError:
        return None

    if payload.get("type") != expected_type:
        return None
    if not payload.get("sub"):
        return None
    return payload
