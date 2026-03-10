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
    goals: Optional[dict[str, dict]] = None  # e.g. {"squat": {"target_weight": 315, "target_date": "2026-06-01"}}


class MaxUpdate(BaseModel):
    exercise_name: str
    max_weight: float
    unit: str = "lbs"


class CalendarExerciseSummary(BaseModel):
    name: str
    sets: int
    reps: int

    class Config:
        from_attributes = True


class CalendarWorkout(BaseModel):
    id: int
    name: str
    scheduled_date: datetime
    is_completed: bool
    is_flagged: bool
    exercises: list[CalendarExerciseSummary] = []

    class Config:
        from_attributes = True


class ProgressDataPoint(BaseModel):
    date: datetime
    max_weight: float


class StrengthGoalResponse(BaseModel):
    id: int
    exercise_name: str
    starting_weight: float
    target_weight: float
    target_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class ProgressResponse(BaseModel):
    exercise_name: str
    current_max: Optional[float] = None
    data: list[ProgressDataPoint]
    goal: Optional[StrengthGoalResponse] = None
