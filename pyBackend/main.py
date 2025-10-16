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
# models for bodys
class User(BaseModel):
    name:str
    id:str
    knownSkills:List[str]
    skillsToLearn:List[str]
    
class PlanRequest(BaseModel):
    users: List[User]
    compatibility: int

    
@app.post('/analyze/{userId}')
async def analyzeMatches(usersForMatch:List[User],thisUser:User):
    prompt =  """
    You are an AI Matchmaking Assistant for a skill exchange app.
    For each user in 'usersForMatch', analyze how compatible they are with 'thisUser'
    based on their knownSkills and skillsToLearn.
    
    Rules:
    - compatibility is from 0% to 100%.
    - If both users can teach each other something (mutual skill exchange), compatibility is higher (70–100%).
    - If only one side can teach something, compatibility is medium (40–70%).
    - If overlap is weak, compatibility is low (0–40%).
    - Return clear JSON: [{{"compatibility": int, "aiExplanation": str,"id":str,"keyBenefits":['...','...','...','...'] }}]
    - aiExplanation must be 2–3 sentences in human tone explaining why they match.
    - keyBenefits must be 4 benefits which clearly indicate why we should teach each other.
     
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



@app.post('/plan')
async def createTrainingPlan(request:PlanRequest):
    prompt =  """
   You are an AI Skill Exchange Plan Generator for a learning app.

You are given a list of users. For each user, you know:
- Their name
- Skills they know
- Skills they want to learn
- Their compatibility score with each other user (0-100)

Your task is to create a structured training plan that teaches users skills they want to learn from each other.

The plan should match the following schema:

Plan:
- modules: a list of modules

Module:
- status: "INPROGRESS" by default
- title: specific title for module
- objectives: a list of 1-3 objectives for this module
- activities: a list of 1-3 concrete activities/exercises
- timeline: duration of the module in weeks (float)
- resources: a list of resources

Resource:
- title: the resource title
- description: optional description
-link: real link for the teaching resourse

Requirements:
1. Each module should focus on teaching a specific skill from one user to another.
2. Prioritize users with higher compatibility.
3. Use simple, concrete objectives and activities.
4. Output should be in **JSON format** exactly matching the schema above.
5. Include at least one resource per module with a title (description optional).
6. Must be at least 4 modules that are diffent + at least 2+ activities and objectives

Example output (JSON):

{
  "modules": [
    {
      "title":'Foundations of JavaScript - Variables & Data Types'
      "status": "INPROGRESS",
      "objectives": ["Learn React basics from Alice"],
      "activities": ["Build a simple React component", "Pair programming session"],
      "timeline": 1.5,
      "resources": [
        {
          "title": "React Official Docs",
          "description": "Follow tutorials and examples"
        }
      ]
    }
  ]
}

Your output must be valid JSON that can be directly parsed into the Plan → Module → Resource structure.

     """
    # configuration for gpt requests   
    try:
        completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
                {"role": "system", "content": prompt},
                {"role": "user",    "content": f"""
                usersForMatch: {request.users}, compatibility: {request.compatibility}%
                """ }
            ],
        temperature=0.7
        )
        return {"AIReport": completion.choices[0].message.content}
    except Exception as error:
        raise HTTPException(status_code=500,detail=str(error))








