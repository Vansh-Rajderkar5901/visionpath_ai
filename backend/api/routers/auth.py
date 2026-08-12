"""Registration, login, session, and password reset."""

from fastapi import APIRouter, HTTPException, status

from api.deps import CurrentUser, DbSession
from core.config import settings
from schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
)
from services.auth_service import AuthError, AuthService

router = APIRouter()


def _token_response(service: AuthService, user) -> TokenResponse:
    return TokenResponse(
        accessToken=service.issue_access_token(user),
        tokenType="bearer",
        expiresIn=settings.access_token_expire_minutes * 60,
        user=user.to_dict(),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: DbSession) -> TokenResponse:
    service = AuthService(db)
    try:
        user = service.create_user(
            name=payload.name,
            email=payload.email,
            password=payload.password,
            phone_number=payload.phoneNumber,
        )
    except AuthError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    return _token_response(service, user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: DbSession) -> TokenResponse:
    service = AuthService(db)
    try:
        user = service.authenticate(payload.email, payload.password)
    except AuthError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _token_response(service, user)


@router.get("/me")
def get_me(user: CurrentUser) -> dict:
    return user.to_dict()


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: DbSession) -> dict:
    """
    Always answers the same way so the endpoint cannot be used to discover which
    email addresses have accounts.

    There is no mail server in this project. In development the reset token is
    returned in the response so the flow can be completed end to end; outside
    development it is withheld and would need to be emailed.
    """
    service = AuthService(db)
    token = service.create_reset_token(payload.email)

    response = {
        "message": "If an account exists for that email, a reset link has been sent."
    }
    if token and settings.environment == "development":
        response["resetToken"] = token
        response["devNote"] = (
            "Returned because ENVIRONMENT=development. Wire up an email provider "
            "before deploying."
        )
    return response


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: DbSession) -> dict:
    service = AuthService(db)
    try:
        service.reset_password(payload.token, payload.newPassword)
    except AuthError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return {"message": "Your password has been reset. You can sign in now."}


@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, user: CurrentUser, db: DbSession) -> dict:
    service = AuthService(db)
    try:
        service.change_password(user, payload.currentPassword, payload.newPassword)
    except AuthError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return {"message": "Your password has been changed."}


@router.post("/logout")
def logout(user: CurrentUser) -> dict:
    """
    Tokens are stateless, so logging out is a client-side action (drop the
    token). This endpoint exists so the client has one call to make and the
    server can log the event.
    """
    return {"message": "Signed out."}
