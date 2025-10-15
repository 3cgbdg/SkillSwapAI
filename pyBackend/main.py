from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import dotenv
from pydantic import BaseModel
from openai import OpenAI

from typing import List
dotenv.load_dotenv()

app = FastAPI()
# cors

app.add_middleware(
    CORSMiddleware,
    allow_origins=[f'{os.getenv("CORS_ORIGIN")}'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
# openai integration
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
class User(BaseModel):
    name:str
    id:str
    knownSkills:List[str]
    skillsToLearn:List[str]
    
@app.post('/analyze/{userId}')
async def analyzeMatches(usersForMatch:List[User],thisUser:User):
    prompt =  f"""
    You are an AI Matchmaking Assistant for a skill exchange app.
    For each user in 'usersForMatch', analyze how compatible they are with 'thisUser'
    based on their knownSkills and skillsToLearn.
    
    Rules:
    - Compatibility is from 0% to 100%.
    - If both users can teach each other something (mutual skill exchange), compatibility is higher (70–100%).
    - If only one side can teach something, compatibility is medium (40–70%).
    - If overlap is weak, compatibility is low (0–40%).
    - Return clear JSON: [{{"compatibility": int, "aiExplanation": str,"id":str }}]
    - aiExplanation must be 2–3 sentences in human tone explaining why they match.
     
     """
    # configuration for gpt requests   
    try:
        completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
                {"role": "system", "content": prompt},
                {"role": "user",    "content": f"""
                thisUser: {thisUser.model_dump()}
                usersForMatch: {usersForMatch}
                """ }
            ],
        temperature=0.7
        )
        return {"AIReport": completion.choices[0].message.content}
    except Exception as error:
        raise HTTPException(status_code=500,detail=str(error))








