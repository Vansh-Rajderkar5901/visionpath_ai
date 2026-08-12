"""Navigation request bodies."""

from typing import Optional

from pydantic import BaseModel, Field


class RouteRequest(BaseModel):
    """
    Ask for a walking route.

    Either node ids or destination names may be given; names are resolved
    against Location.location_name / display_name before routing.
    """

    fromNode: Optional[str] = Field(default=None, max_length=128)
    toNode: Optional[str] = Field(default=None, max_length=128)
    fromLocationId: Optional[int] = None
    toLocationId: Optional[int] = None
    record: bool = True


class CreateBuildingRequest(BaseModel):
    code: str = Field(min_length=1, max_length=32)
    name: str = Field(min_length=1, max_length=128)
    address: Optional[str] = Field(default=None, max_length=255)
    latitude: float = 0.0
    longitude: float = 0.0
    totalFloors: int = Field(default=1, ge=1)


class CreateFloorRequest(BaseModel):
    buildingId: int
    floorNo: int
    floorName: str = Field(min_length=1, max_length=64)
