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

# metrics
def calculateMetrics(height,width,landmarks,poseHeight,poseWeight,gender):
    return None

def getMetrics():
    return None


