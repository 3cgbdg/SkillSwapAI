from fastapi import APIRouter, Depends, HTTPException
from core.openai import get_ai_client
from core.auth import verify_service_token
from core.prompts import MATCH_ACTIVE_PROMPT
from schemas.user import User
from logger import logger
from time import perf_counter
import json

router = APIRouter(
    prefix="/match",
    tags=["match"],
    dependencies=[Depends(verify_service_token)],
)


@router.post("/active")
async def createTrainingPlan(user1: User, user2: User):
    logger.info("API match/active")
    try:
        start = perf_counter()
        logger.info("Starting ai request")
        client = get_ai_client()
        completion = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": MATCH_ACTIVE_PROMPT},
                {
                    "role": "user",
                    "content": f"myProfile: {user1.model_dump()}, otherProfile: {user2.model_dump()}",
                },
            ],
            temperature=0.7,
        )
        end = perf_counter()
        logger.info(f"Finished ai request | DURATION - {end - start}s")
        content = completion.choices[0].message.content or "{}"
        json.loads(content)
        return {"AIReport": content}
    except Exception as error:
        logger.error("Failed to make ai request", exc_info=True)
        raise HTTPException(status_code=500, detail=str(error))
