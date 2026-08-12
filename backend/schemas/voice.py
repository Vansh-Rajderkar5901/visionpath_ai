"""Voice assistant request bodies."""

from pydantic import BaseModel, Field


class VoiceCommandRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    currentNode: str | None = Field(default=None, max_length=128)
