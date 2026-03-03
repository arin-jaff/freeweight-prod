from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OnboardingRequest(BaseModel):
    sport: Optional[str] = None
    team: Optional[str] = None
    training_goals: Optional[str] = None
    maxes: Optional[dict[str, float]] = None

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
