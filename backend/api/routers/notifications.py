"""In-app notifications for the signed-in user."""

from fastapi import APIRouter, HTTPException, status

from api.deps import CurrentUser, DbSession
from models.notification import Notification

router = APIRouter()


@router.get("")
def list_notifications(
    user: CurrentUser, db: DbSession, unreadOnly: bool = False, limit: int = 50
) -> dict:
    stmt = db.query(Notification).filter(Notification.user_id == user.user_id)
    if unreadOnly:
        stmt = stmt.filter(Notification.is_read.is_(False))

    rows = stmt.order_by(Notification.created_at.desc()).limit(min(limit, 200)).all()
    unread = (
        db.query(Notification)
        .filter(Notification.user_id == user.user_id, Notification.is_read.is_(False))
        .count()
    )
    return {
        "items": [row.to_dict() for row in rows],
        "unreadCount": unread,
    }


@router.post("/{notification_id}/read")
def mark_read(notification_id: int, user: CurrentUser, db: DbSession) -> dict:
    notification = db.get(Notification, notification_id)
    if notification is None or notification.user_id != user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification.to_dict()


@router.post("/read-all")
def mark_all_read(user: CurrentUser, db: DbSession) -> dict:
    updated = (
        db.query(Notification)
        .filter(Notification.user_id == user.user_id, Notification.is_read.is_(False))
        .update({"is_read": True})
    )
    db.commit()
    return {"updated": updated}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: int, user: CurrentUser, db: DbSession) -> None:
    notification = db.get(Notification, notification_id)
    if notification is None or notification.user_id != user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )
    db.delete(notification)
    db.commit()
