from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OnboardingRequest(BaseModel):
    sport: Optional[str] = None
    team: Optional[str] = None
    training_goals: Optional[str] = None
    injuries: Optional[str] = None
    experience_level: Optional[str] = None  # beginner, intermediate, advanced
    maxes: Optional[dict[str, float]] = None
    has_coach: bool = False  # True if athlete signed up with invite code

class MaxUpdate(BaseModel):
    exercise_name: str
    max_weight: float
    unit: str = "lbs"

class CalendarWorkout(BaseModel):
    id: int
    name: str
    scheduled_date: datetime
    is_completed: bool
    is_flagged: bool

    class Config:
        from_attributes = True

class CalendarResponse(BaseModel):
    workouts: list[CalendarWorkout]

class ProgressDataPoint(BaseModel):
    date: datetime
    max_weight: float

class ProgressResponse(BaseModel):
    exercise_name: str
    data: list[ProgressDataPoint]
