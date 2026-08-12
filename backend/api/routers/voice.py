"""Server-side voice command understanding."""

from fastapi import APIRouter

from api.deps import CurrentUser, DbSession
from schemas.voice import VoiceCommandRequest
from services.voice_service import COMMAND_PATTERNS, HELP_TEXT, VoiceService

router = APIRouter()


@router.post("/command")
def handle_command(payload: VoiceCommandRequest, user: CurrentUser, db: DbSession) -> dict:
    """
    Interpret an utterance and act on it.

    When the intent is navigation and `currentNode` is supplied, the response
    carries a fully computed route, so the browser can start speaking turn by
    turn without a second request.
    """
    return VoiceService(db).handle(payload.text, payload.currentNode)


@router.get("/commands")
def list_commands() -> dict:
    """The supported phrasings, so the UI's help panel stays in sync with the parser."""
    examples = [
        {"command": "Take me to BS-17A", "description": "Route to any room", "intent": "navigate"},
        {"command": "Guide me to the Faculty Room", "description": "Route by name", "intent": "navigate"},
        {"command": "Where is the nearest washroom?", "description": "Find a facility", "intent": "search"},
        {"command": "Read this", "description": "Open the OCR reader", "intent": "read"},
        {"command": "Call security", "description": "Emergency contacts", "intent": "call"},
        {"command": "Open the campus map", "description": "Jump to a page", "intent": "open"},
        {"command": "Emergency", "description": "Raise an SOS alert", "intent": "emergency"},
        {"command": "Help", "description": "Hear the command list", "intent": "help"},
    ]
    return {
        "examples": examples,
        "intents": sorted({intent for _, intent, _ in COMMAND_PATTERNS}),
        "helpText": HELP_TEXT,
    }
