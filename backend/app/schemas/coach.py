from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AthleteBasic(BaseModel):
    id: int
    name: str
    email: str
    profile_photo_url: Optional[str] = None
    sport: Optional[str] = None
    team: Optional[str] = None

    class Config:
        from_attributes = True

class FlaggedAthlete(BaseModel):
    id: int
    name: str
    flag_reason: str
    flagged_at: datetime

class DashboardResponse(BaseModel):
    completed_workouts_today: int
    flagged_athletes: List[FlaggedAthlete]
    total_athletes: int

class GroupBasic(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class SubgroupBasic(BaseModel):
    id: int
    name: str
    training_focus: Optional[str] = None

    class Config:
        from_attributes = True

class AthleteWithGroups(AthleteBasic):
    groups: List[GroupBasic]
    subgroups: List[SubgroupBasic]

class RosterResponse(BaseModel):
    athletes: List[AthleteWithGroups]

class InviteLinkResponse(BaseModel):
    invite_link: str
    coach_id: int
