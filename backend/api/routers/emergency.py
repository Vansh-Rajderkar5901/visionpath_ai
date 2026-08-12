"""Emergency contacts and SOS alerts."""

from datetime import datetime

from fastapi import APIRouter, HTTPException, status

from api.deps import CurrentUser, DbSession
from models.emergency import ALERT_ACTIVE, ALERT_RESOLVED, EmergencyAlert, EmergencyContact
from models.notification import Notification
from models.user import ROLE_ADMIN, User
from schemas.emergency import ContactRequest, SOSRequest

router = APIRouter()


@router.get("/contacts")
def list_contacts(user: CurrentUser, db: DbSession) -> list[dict]:
    contacts = (
        db.query(EmergencyContact)
        .filter(
            EmergencyContact.user_id == user.user_id,
            EmergencyContact.is_active.is_(True),
        )
        .order_by(EmergencyContact.is_primary.desc(), EmergencyContact.name)
        .all()
    )
    return [contact.to_dict() for contact in contacts]


@router.post("/contacts", status_code=status.HTTP_201_CREATED)
def create_contact(payload: ContactRequest, user: CurrentUser, db: DbSession) -> dict:
    if payload.isPrimary:
        db.query(EmergencyContact).filter(
            EmergencyContact.user_id == user.user_id
        ).update({"is_primary": False})

    contact = EmergencyContact(
        user_id=user.user_id,
        name=payload.name,
        phone=payload.phone,
        relation=payload.relationship,
        is_primary=payload.isPrimary,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact.to_dict()


@router.put("/contacts/{contact_id}")
def update_contact(
    contact_id: int, payload: ContactRequest, user: CurrentUser, db: DbSession
) -> dict:
    contact = _owned_contact(db, user, contact_id)

    if payload.isPrimary and not contact.is_primary:
        db.query(EmergencyContact).filter(
            EmergencyContact.user_id == user.user_id
        ).update({"is_primary": False})

    contact.name = payload.name
    contact.phone = payload.phone
    contact.relation = payload.relationship
    contact.is_primary = payload.isPrimary
    db.commit()
    db.refresh(contact)
    return contact.to_dict()


@router.delete("/contacts/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, user: CurrentUser, db: DbSession) -> None:
    contact = _owned_contact(db, user, contact_id)
    db.delete(contact)
    db.commit()


@router.post("/sos", status_code=status.HTTP_201_CREATED)
def trigger_sos(payload: SOSRequest, user: CurrentUser, db: DbSession) -> dict:
    """
    Raise an alert and notify every administrator.

    This records and broadcasts inside the platform. It does not dial emergency
    services — the UI still surfaces the campus security and medical numbers for
    that.
    """
    alert = EmergencyAlert(
        user_id=user.user_id,
        alert_type=payload.type,
        latitude=payload.latitude,
        longitude=payload.longitude,
        accuracy=payload.accuracy,
        building=payload.building,
        floor=payload.floor,
        message=payload.message,
        status=ALERT_ACTIVE,
    )
    db.add(alert)
    db.flush()

    where = payload.building or "an unknown location"
    for admin in db.query(User).filter(User.role_id == ROLE_ADMIN).all():
        db.add(
            Notification(
                user_id=admin.user_id,
                notification_type="emergency",
                title=f"{payload.type.upper()} alert from {user.display_name}",
                message=f"Emergency raised at {where}. Open the admin panel to respond.",
                action_url="/dashboard/admin",
            )
        )

    db.commit()
    db.refresh(alert)

    contacts = (
        db.query(EmergencyContact)
        .filter(
            EmergencyContact.user_id == user.user_id,
            EmergencyContact.is_active.is_(True),
        )
        .all()
    )

    return {
        "alert": alert.to_dict(),
        "notifiedContacts": [contact.to_dict() for contact in contacts],
        "message": "Emergency alert raised. Campus administrators have been notified.",
    }


@router.get("/alerts")
def list_alerts(user: CurrentUser, db: DbSession) -> list[dict]:
    alerts = (
        db.query(EmergencyAlert)
        .filter(EmergencyAlert.user_id == user.user_id)
        .order_by(EmergencyAlert.created_at.desc())
        .limit(50)
        .all()
    )
    return [alert.to_dict() for alert in alerts]


@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, user: CurrentUser, db: DbSession) -> dict:
    alert = db.get(EmergencyAlert, alert_id)
    if alert is None or (alert.user_id != user.user_id and user.role_id != ROLE_ADMIN):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found"
        )

    alert.status = ALERT_RESOLVED
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert.to_dict()


def _owned_contact(db, user, contact_id: int) -> EmergencyContact:
    contact = db.get(EmergencyContact, contact_id)
    if contact is None or contact.user_id != user.user_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found"
        )
    return contact
