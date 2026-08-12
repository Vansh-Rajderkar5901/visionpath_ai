"""The signed-in user's own profile and preferences."""

from fastapi import APIRouter, HTTPException, status

from api.deps import CurrentUser, DbSession
from models.user import UserPreference
from schemas.user import PreferencesRequest, UpdateModeRequest, UpdateProfileRequest
from services.preference_service import apply_mode_defaults

router = APIRouter()


def _ensure_preferences(db, user) -> UserPreference:
    if user.preferences is None:
        preferences = UserPreference(user_id=user.user_id)
        apply_mode_defaults(preferences, user.accessibility_mode)
        db.add(preferences)
        db.commit()
        db.refresh(user)
    return user.preferences


@router.get("/me")
def get_profile(user: CurrentUser, db: DbSession) -> dict:
    _ensure_preferences(db, user)
    return user.to_dict()


@router.patch("/me")
def update_profile(payload: UpdateProfileRequest, user: CurrentUser, db: DbSession) -> dict:
    if payload.email and payload.email.lower() != user.email:
        from models.user import User

        clash = (
            db.query(User)
            .filter(User.email == payload.email.lower(), User.user_id != user.user_id)
            .first()
        )
        if clash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="That email is already used by another account",
            )
        user.email = payload.email.lower()

    if payload.name is not None:
        user.full_name = payload.name.strip()
    if payload.phoneNumber is not None:
        user.phone_number = payload.phoneNumber.strip() or None

    if payload.accessibilityMode is not None:
        user.accessibility_mode = payload.accessibilityMode
        user.is_visually_impaired = payload.accessibilityMode == "visually-impaired"
        apply_mode_defaults(_ensure_preferences(db, user), payload.accessibilityMode)

    db.commit()
    db.refresh(user)
    return user.to_dict()


@router.put("/me/mode")
def update_mode(payload: UpdateModeRequest, user: CurrentUser, db: DbSession) -> dict:
    """
    Switch accessibility mode. This resets the mode-driven preferences to that
    mode's preset — the same behaviour the onboarding screen describes.
    """
    user.accessibility_mode = payload.accessibilityMode
    user.is_visually_impaired = payload.accessibilityMode == "visually-impaired"
    apply_mode_defaults(_ensure_preferences(db, user), payload.accessibilityMode)
    db.commit()
    db.refresh(user)
    return user.to_dict()


@router.get("/me/preferences")
def get_preferences(user: CurrentUser, db: DbSession) -> dict:
    return _ensure_preferences(db, user).to_dict()


@router.put("/me/preferences")
def update_preferences(payload: PreferencesRequest, user: CurrentUser, db: DbSession) -> dict:
    preferences = _ensure_preferences(db, user)
    preferences.apply(payload.model_dump(exclude_none=True))
    db.commit()
    db.refresh(user)
    return user.to_dict()
