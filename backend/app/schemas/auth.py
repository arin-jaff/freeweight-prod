from pydantic import BaseModel, EmailStr
from typing import Optional
from ..models import UserType

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    user_type: UserType
    sport: Optional[str] = None
    team: Optional[str] = None
    training_goals: Optional[str] = None
    coaching_credentials: Optional[str] = None
    bio: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional["UserResponse"] = None

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    user_type: UserType
    profile_photo_url: Optional[str]
    sport: Optional[str]
    team: Optional[str]
    training_goals: Optional[str]
    coaching_credentials: Optional[str]
    bio: Optional[str]

    class Config:
        from_attributes = True
