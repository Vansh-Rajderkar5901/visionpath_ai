"""
Voice command understanding.

Intent parsing lives on the server so the browser and the API cannot drift
apart, and so a `navigate` command can be resolved to a real graph node and
answered with a real route in a single round trip.
"""

import re
from typing import Optional

from sqlalchemy.orm import Session

from services.navigation_service import NavigationError, NavigationService

# Ordered: the first pattern that matches wins, so specific phrasings must
# come before the greedy catch-alls ("read this" before "read (.*)").
COMMAND_PATTERNS: list[tuple[re.Pattern, str, list[str]]] = [
    (re.compile(r"^\s*(?:take|guide|lead)\s+me\s+to\s+(.+)$", re.I), "navigate", ["destination"]),
    (re.compile(r"^\s*navigate\s+(?:me\s+)?to\s+(.+)$", re.I), "navigate", ["destination"]),
    (re.compile(r"^\s*(?:go|walk)\s+to\s+(.+)$", re.I), "navigate", ["destination"]),
    (re.compile(r"^\s*where\s+is\s+(?:the\s+)?(.+?)\??\s*$", re.I), "search", ["place"]),
    (re.compile(r"^\s*find\s+(?:the\s+)?(.+)$", re.I), "search", ["place"]),
    (re.compile(r"^\s*read\s+this.*$", re.I), "read", []),
    (re.compile(r"^\s*read\s+(.+)$", re.I), "read", ["text"]),
    (re.compile(r"^\s*call\s+(.+)$", re.I), "call", ["contact"]),
    (re.compile(r"^\s*open\s+(.+)$", re.I), "open", ["page"]),
    (re.compile(r"^\s*search\s+(?:for\s+)?(.+)$", re.I), "search", ["query"]),
    (re.compile(r"\b(?:emergency|sos|help me)\b", re.I), "emergency", []),
    (re.compile(r"^\s*(?:help|what can you do)\b.*$", re.I), "help", []),
    (re.compile(r"^\s*(?:cancel|stop|never mind)\b.*$", re.I), "cancel", []),
]

PAGE_ROUTES: dict[str, str] = {
    "home": "/dashboard",
    "dashboard": "/dashboard",
    "map": "/dashboard/map",
    "maps": "/dashboard/map",
    "campus map": "/dashboard/map",
    "indoor": "/dashboard/indoor",
    "indoor navigation": "/dashboard/indoor",
    "navigation": "/dashboard/indoor",
    "voice": "/dashboard/voice",
    "voice assistant": "/dashboard/voice",
    "ocr": "/dashboard/ocr",
    "scanner": "/dashboard/ocr",
    "reader": "/dashboard/ocr",
    "emergency": "/dashboard/emergency",
    "sos": "/dashboard/emergency",
    "profile": "/dashboard/profile",
    "settings": "/dashboard/profile",
    "admin": "/dashboard/admin",
}

HELP_TEXT = (
    "You can say: take me to B S 17 A. Where is the nearest washroom. "
    "Read this. Call security. Open the campus map. Or say emergency to raise an S O S."
)


def _describe_distance(metres: float, seconds: int) -> str:
    """
    Phrase a distance and walking time for speech.

    The whole reply is read aloud, so it has to be grammatical: short hops are
    given in seconds rather than being rounded up to "1 minutes".
    """
    distance = f"{round(metres)} metres"
    if seconds < 60:
        return f"{distance}, about {max(5, round(seconds / 5) * 5)} seconds"

    minutes = round(seconds / 60)
    unit = "minute" if minutes == 1 else "minutes"
    return f"{distance}, about {minutes} {unit}"


class VoiceService:
    def __init__(self, db: Session):
        self.db = db
        self.navigation = NavigationService(db)

    def parse(self, text: str) -> dict:
        """Classify the utterance and pull out its entities."""
        for pattern, intent, entity_names in COMMAND_PATTERNS:
            match = pattern.search(text)
            if not match:
                continue
            entities = {
                name: (match.group(index + 1) or "").strip()
                for index, name in enumerate(entity_names)
            }
            return {"intent": intent, "entities": entities}

        return {"intent": "unknown", "entities": {}}

    def handle(self, text: str, current_node: Optional[str] = None) -> dict:
        """Parse the command and, where possible, act on it."""
        parsed = self.parse(text)
        intent = parsed["intent"]
        entities = parsed["entities"]

        result: dict = {
            "transcript": text,
            "intent": intent,
            "entities": entities,
            "action": None,
            "route": None,
            "matches": [],
            "response": "",
        }

        if intent == "navigate":
            return self._handle_navigate(result, entities.get("destination", ""), current_node)

        if intent == "search":
            term = entities.get("place") or entities.get("query") or ""
            return self._handle_search(result, term, current_node)

        if intent == "open":
            page = (entities.get("page") or "").strip().lower().rstrip("?.!")
            route = PAGE_ROUTES.get(page) or PAGE_ROUTES.get(page.replace("the ", ""))
            if route:
                result["action"] = {"type": "open", "url": route}
                result["response"] = f"Opening {page}."
            else:
                result["response"] = f"I could not find a page called {page}."
            return result

        if intent == "read":
            result["action"] = {"type": "read-aloud"}
            result["response"] = "Opening the reader. Point your camera at the text."
            return result

        if intent == "call":
            contact = entities.get("contact", "")
            result["action"] = {"type": "call", "contact": contact}
            result["response"] = f"Calling {contact}."
            return result

        if intent == "emergency":
            result["action"] = {"type": "emergency-sos"}
            result["response"] = (
                "Emergency mode activated. Sending your location to your emergency contacts."
            )
            return result

        if intent == "help":
            result["response"] = HELP_TEXT
            return result

        if intent == "cancel":
            result["action"] = {"type": "cancel"}
            result["response"] = "Cancelled. How can I help you?"
            return result

        result["response"] = (
            "I did not understand that. Say help to hear what I can do."
        )
        return result

    # ---------- intent handlers ----------

    def _handle_navigate(self, result: dict, destination: str, current_node: Optional[str]) -> dict:
        destination = destination.strip().rstrip("?.!")
        if not destination:
            result["response"] = "Where would you like to go?"
            return result

        try:
            target = self.navigation.resolve_node(destination)
        except NavigationError:
            matches = self.navigation.destinations(destination)
            result["matches"] = [location.to_dict() for location in matches[:5]]
            if matches:
                names = ", ".join(location.display_label for location in matches[:3])
                result["response"] = f"I could not find {destination}. Did you mean {names}?"
            else:
                result["response"] = f"I could not find a place called {destination}."
            return result

        result["action"] = {"type": "navigate", "nodeId": target.node_id, "name": target.node_name}

        if not current_node:
            result["response"] = (
                f"{target.node_name} found. Choose your current location to start guidance."
            )
            return result

        try:
            route = self.navigation.route(current_node, target.node_id)
        except NavigationError as exc:
            result["response"] = str(exc)
            return result

        result["route"] = route
        first_step = (
            route["instructions"][1]["text"] if len(route["instructions"]) > 1 else ""
        )
        result["response"] = (
            f"Navigating to {target.node_name}. "
            f"{_describe_distance(route['distance'], route['estimatedTime'])}. "
            f"{first_step}"
        ).strip()
        return result

    def _handle_search(self, result: dict, term: str, current_node: Optional[str]) -> dict:
        term = term.strip().rstrip("?.!")
        if not term:
            result["response"] = "What would you like me to find?"
            return result

        # "nearest washroom" -> search the facility type, not the literal phrase.
        cleaned = re.sub(r"\b(nearest|closest|the|a|an)\b", " ", term, flags=re.I).strip()
        matches = self.navigation.destinations(cleaned or term)
        result["matches"] = [location.to_dict() for location in matches[:5]]

        if not matches:
            result["response"] = f"I could not find anything matching {term}."
            return result

        best = matches[0]
        result["action"] = {
            "type": "navigate",
            "nodeId": best.node_id,
            "name": best.display_label,
        }

        if current_node and best.node_id:
            try:
                route = self.navigation.route(current_node, best.node_id)
                result["route"] = route
                result["response"] = (
                    f"The nearest {cleaned or term} is {best.display_label}, "
                    f"{_describe_distance(route['distance'], route['estimatedTime'])} away."
                )
                return result
            except NavigationError:
                pass

        result["response"] = (
            f"I found {best.display_label} on {best.floor.floor_name}."
            if best.floor
            else f"I found {best.display_label}."
        )
        return result
