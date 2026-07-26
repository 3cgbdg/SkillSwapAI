from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from os import getenv
from dotenv import load_dotenv
from logger import logger
from api.match import router as match_router
from api.profile import router as profile_router
from mangum import Mangum

load_dotenv()

app = FastAPI(description="Python AI microservice")
handler = Mangum(app)


@app.get("/health")
async def health_check():
    logger.info(f"Server started on {getenv('PORT', 8000)}")
    return {"status": "ok"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"{getenv('CORS_ORIGIN')}"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(match_router)
app.include_router(profile_router)






