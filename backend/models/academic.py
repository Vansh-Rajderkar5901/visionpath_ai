"""Class timetable, used by the dashboard's "Upcoming Classes" panel."""

from sqlalchemy import Column, ForeignKey, Integer, String, Time
from sqlalchemy.orm import relationship

from database.config import Base

WEEKDAYS = (
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
)


class ClassSchedule(Base):
    __tablename__ = "class_schedule"

    class_id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String(128), nullable=False)
    instructor = Column(String(128))
    location_id = Column(Integer, ForeignKey("location.location_id"), nullable=True)
    day_of_week = Column(String(16), nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    location = relationship("Location")

    def to_dict(self) -> dict:
        """Shaped to match the frontend `UpcomingClass` type."""
        location = self.location
        floor = location.floor if location else None
        building = floor.building if floor else None
        return {
            "id": str(self.class_id),
            "courseName": self.course_name,
            "instructor": self.instructor,
            "room": location.display_label if location else "",
            "building": building.building_name if building else "",
            "nodeId": location.node_id if location else None,
            "day": self.day_of_week,
            "startTime": self.start_time.isoformat() if self.start_time else None,
            "endTime": self.end_time.isoformat() if self.end_time else None,
        }
