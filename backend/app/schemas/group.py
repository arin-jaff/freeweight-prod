from pydantic import BaseModel
from typing import Optional

class GroupCreate(BaseModel):
    name: str
    sport: Optional[str] = None

class SubgroupCreate(BaseModel):
    name: str
    training_focus: Optional[str] = None
