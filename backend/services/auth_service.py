"""
Authentication Service
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from pydantic import BaseModel
from dotenv import load_dotenv

from models.user import User

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenData(BaseModel):
    sub: str
    exp: Optional[datetime] = None


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(
    self,
    username: str,
    full_name: str,
    email: str,
    phone_number: str,
    password: str,
) -> User:
        """Create a new user with default preferences"""
        existing = self.db.query(User).filter(User.email == email).first()
        if existing:
            raise ValueError("Email already registered")

        user = User(
          username=username,
          full_name=full_name,
          email=email,
          phone_number=phone_number,
          password_hash=self.hash_password(password),
          role_id=2,                 # Default USER role
          is_visually_impaired=False,
          account_status="ACTIVE",
          created_at=datetime.utcnow(),
)
        self.db.add(user)

        self.db.commit()
        self.db.refresh(user)

        return user
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not self.verify_password(password, user.password_hash):
            return None
        return user

    def authenticate_with_google(self, firebase_token: str) -> User:
        """Authenticate with Google Firebase token"""
        try:
            # Verify Firebase token (simplified for now)
            # In production, use firebase_admin.auth.verify_id_token(token)
            import firebase_admin
            from firebase_admin import auth as firebase_auth

            if not firebase_admin._apps:
                cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-credentials.json")
                cred = firebase_admin.credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)

            decoded_token = firebase_auth.verify_id_token(firebase_token)
            firebase_uid = decoded_token.get("uid")
            email = decoded_token.get("email", "")
            name = decoded_token.get("name", email.split("@")[0])

            # Check if user exists
            user = self.db.query(User).filter(
                (User.firebase_uid == firebase_uid) | (User.email == email)
            ).first()

            if not user:
                user = User(
                    id=uuid.uuid4(),
                    email=email,
                    name=name,
                    password_hash="",
                    firebase_uid=firebase_uid,
                    photo_url=decoded_token.get("picture"),
                )
                self.db.add(user)
                self.db.flush()

                prefs = UserPreferences(user_id=user.id)
                self.db.add(prefs)
                self.db.flush()
                self.db.add(NotificationPreference(preferences_id=prefs.id))
                self.db.commit()
                self.db.refresh(user)

            return user

        except Exception as e:
            raise ValueError(f"Google authentication failed: {str(e)}")

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            uid = uuid.UUID(user_id)
            return self.db.query(User).filter(User.id == uid).first()
        except ValueError:
            return None

    def update_user_mode(self, user_id: str, mode: str) -> User:
        """Update user accessibility mode"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        try:
            user.accessibility_mode = AccessibilityMode(mode)
            self.db.commit()
            self.db.refresh(user)
            return user
        except ValueError:
            raise ValueError(f"Invalid accessibility mode: {mode}")

    def update_user_preferences(self, user_id: str, preferences: dict) -> UserPreferences:
        """Update user preferences"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        prefs = self.db.query(UserPreferences).filter(
            UserPreferences.user_id == user.id
        ).first()

        if not prefs:
            prefs = UserPreferences(user_id=user.id)
            self.db.add(prefs)
            self.db.flush()

        for key, value in preferences.items():
            if hasattr(prefs, key):
                setattr(prefs, key, value)

        self.db.commit()
        self.db.refresh(prefs)
        return prefs

    def initiate_password_reset(self, email: str):
        """Initiate password reset process"""
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            return  # Don't reveal if email exists

        # In production, send email with reset token
        reset_token = self.create_access_token(
            data={"sub": str(user.id), "type": "reset"},
            expires_delta=timedelta(hours=1),
        )
        # Send email logic here
        return reset_token

    def reset_password(self, token: str, new_password: str):
        """Reset user password"""
        payload = self.decode_token(token)
        if not payload or payload.get("type") != "reset":
            raise ValueError("Invalid or expired reset token")

        user = self.get_user_by_id(payload["sub"])
        if not user:
            raise ValueError("User not found")

        user.password_hash = self.hash_password(new_password)
        self.db.commit()

    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    def decode_token(self, token: str) -> Optional[dict]:
        """Decode JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None

