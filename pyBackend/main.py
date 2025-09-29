from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
import os
import dotenv
import math
from pydantic import BaseModel
from openai import OpenAI
import numpy as np
from typing import Optional
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



def getMetrics():
    return None

        # configuration for gpt requests   
    #     completion= client.chat.completions.create(
    #         model="gpt-4o-mini",
    #         messages=[
    #             {"role": "system", "content": "You are fitness coach"},
    #             {"role": "user", "content": prompt}
    #         ],
    #         temperature=0.7
    #     )
    #     return {"AIreport": completion.choices[0].message.content}
    # except Exception as error:
    #     raise HTTPException(status_code=500,detail=str(error))



