from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from os import getenv
from .core.openai import init_ai
app = FastAPI(description="Python AI microservice")

# ai client
client = init_ai()

# health check endpoint
@app.get('/health')
async def health_check():
    return {"status": "ok"}

# cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f'{getenv("CORS_ORIGIN")}'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)







