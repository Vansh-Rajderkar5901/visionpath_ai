"""
Authentication API Router
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel, EmailStr

from database.config import get_db
from services.auth_service import AuthService, TokenData

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class ResetPasswordRequest(BaseModel):
    email: EmailStr


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    auth_service = AuthService(db)
    try:
        user = auth_service.create_user(
            name=request.name,
            email=request.email,
            password=request.password,
        )
        access_token = auth_service.create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(days=1),
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user.to_dict(),
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password"""
    auth_service = AuthService(db)
    user = auth_service.authenticate_user(
        email=request.email,
        password=request.password,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(days=1),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict(),
    }


@router.post("/google")
async def google_login(token: str, db: Session = Depends(get_db)):
    """Login with Google Firebase token"""
    auth_service = AuthService(db)
    try:
        user = auth_service.authenticate_with_google(token)
        access_token = auth_service.create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(days=1),
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user.to_dict(),
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post("/forgot-password")
async def forgot_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Send password reset email"""
    auth_service = AuthService(db)
    try:
        auth_service.initiate_password_reset(request.email)
        return {"message": "Password reset email sent if account exists"}
    except Exception:
        # Don't reveal if email exists
        return {"message": "Password reset email sent if account exists"}


@router.post("/reset-password")
async def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """Reset password with reset token"""
    auth_service = AuthService(db)
    try:
        auth_service.reset_password(token, new_password)
        return {"message": "Password reset successful"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("/me")
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    auth_service = AuthService(db)
    payload = auth_service.decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )
    user = auth_service.get_user_by_id(payload.sub)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user.to_dict()

