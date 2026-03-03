from pydantic import BaseModel
from typing import Optional
from ..models import UserType

class UserBase(BaseModel):
    email: str
    name: str
    user_type: UserType

class User(UserBase):
    id: int
    profile_photo_url: Optional[str]
    sport: Optional[str]
    team: Optional[str]
    training_goals: Optional[str]
    coaching_credentials: Optional[str]
    bio: Optional[str]

    class Config:
        from_attributes = True
