from pydantic import BaseModel, Field
from typing import List


class User(BaseModel):
    name: str = Field(max_length=120)
    id: str = Field(max_length=64)
    knownSkills: List[str] = Field(max_length=30)
    skillsToLearn: List[str] = Field(max_length=30)
