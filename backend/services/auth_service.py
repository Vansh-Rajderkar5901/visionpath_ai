"""Registration, login, and password reset."""

import re
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from core.security import (
    TOKEN_TYPE_ACCESS,
    TOKEN_TYPE_RESET,
    create_token,
    decode_token,
    hash_password,
    verify_password,
)
from models.emergency import EmergencyContact
from models.user import (
    ACCOUNT_ACTIVE,
    DEFAULT_ACCESSIBILITY_MODE,
    ROLE_USER,
    User,
    UserPreference,
)
from services.preference_service import apply_mode_defaults

# (name, phone, relationship, is_primary)
DEFAULT_EMERGENCY_CONTACTS = (
    ("Campus Security", "1999", "Security", True),
    ("Medical Emergency", "1998", "Medical", False),
)


class AuthError(Exception):
    """Raised for expected auth failures; routers turn these into 4xx responses."""


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    # ---------- helpers ----------

    def _unique_username(self, email: str, full_name: str) -> str:
        base = re.sub(r"[^a-z0-9_.]", "", email.split("@")[0].lower()) or "user"
        base = base[:40]
        candidate = base
        suffix = 1
        while self.db.query(User).filter(User.username == candidate).first():
            suffix += 1
            candidate = f"{base}{suffix}"
        return candidate

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower()).first()

    def get_by_id(self, user_id: int | str) -> Optional[User]:
        try:
            return self.db.get(User, int(user_id))
        except (TypeError, ValueError):
            return None

    # ---------- registration & login ----------

    def create_user(
        self,
        name: str,
        email: str,
        password: str,
        phone_number: Optional[str] = None,
        role_id: int = ROLE_USER,
        accessibility_mode: str = DEFAULT_ACCESSIBILITY_MODE,
    ) -> User:
        email = email.lower().strip()
        if self.get_by_email(email):
            raise AuthError("An account with this email already exists")

        user = User(
            username=self._unique_username(email, name),
            full_name=name.strip(),
            email=email,
            phone_number=phone_number,
            password_hash=hash_password(password),
            role_id=role_id,
            accessibility_mode=accessibility_mode,
            is_visually_impaired=accessibility_mode == "visually-impaired",
            account_status=ACCOUNT_ACTIVE,
        )
        self.db.add(user)
        self.db.flush()  # assigns user.user_id

        preferences = UserPreference(user_id=user.user_id)
        apply_mode_defaults(preferences, accessibility_mode)
        self.db.add(preferences)

        # Every account starts with the campus emergency numbers so the SOS
        # screen is useful before the user adds anyone of their own.
        for name, phone, relation, primary in DEFAULT_EMERGENCY_CONTACTS:
            self.db.add(
                EmergencyContact(
                    user_id=user.user_id,
                    name=name,
                    phone=phone,
                    relation=relation,
                    is_primary=primary,
                )
            )

        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate(self, email: str, password: str) -> User:
        user = self.get_by_email(email)
        # Always run a verify to keep the timing similar for unknown emails.
        if not verify_password(password, user.password_hash if user else None):
            raise AuthError("Invalid email or password")
        if user.account_status != ACCOUNT_ACTIVE:
            raise AuthError("This account has been suspended")

        user.last_login = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user

    def issue_access_token(self, user: User) -> str:
        return create_token(user.user_id, TOKEN_TYPE_ACCESS)

    # ---------- password reset ----------

    def create_reset_token(self, email: str) -> Optional[str]:
        """Returns a token, or None when no such account exists."""
        user = self.get_by_email(email)
        if not user:
            return None
        return create_token(user.user_id, TOKEN_TYPE_RESET)

    def reset_password(self, token: str, new_password: str) -> User:
        payload = decode_token(token, expected_type=TOKEN_TYPE_RESET)
        if payload is None:
            raise AuthError("This reset link is invalid or has expired")

        user = self.get_by_id(payload["sub"])
        if not user:
            raise AuthError("This reset link is invalid or has expired")

        user.password_hash = hash_password(new_password)
        self.db.commit()
        self.db.refresh(user)
        return user

    def change_password(self, user: User, current_password: str, new_password: str) -> User:
        if not verify_password(current_password, user.password_hash):
            raise AuthError("Your current password is incorrect")
        user.password_hash = hash_password(new_password)
        self.db.commit()
        self.db.refresh(user)
        return user
