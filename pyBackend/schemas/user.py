from pydantic import BaseModel
from typing import List

# models for bodys
class User(BaseModel):
    name:str
    id:str
    knownSkills:List[str]
    skillsToLearn:List[str]
    
