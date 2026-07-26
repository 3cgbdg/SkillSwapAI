from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from core.openai import get_ai_client
from core.auth import verify_service_token
from core.prompts import PROFILE_SKILLS_PROMPT
from logger import logger
from time import perf_counter
import json

router = APIRouter(
    prefix="/profile",
    tags=["profile"],
    dependencies=[Depends(verify_service_token)],
)


class SkillsRequest(BaseModel):
    skillsToLearn: list[str] = Field(max_length=30)
    knownSkills: list[str] = Field(max_length=30)


@router.post("/skills")
async def createAiSkillsSuggestions(body: SkillsRequest):
    logger.info("API profile/skills")
    try:
        start = perf_counter()
        logger.info("Starting ai request")
        client = get_ai_client()
        completion = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": PROFILE_SKILLS_PROMPT},
                {
                    "role": "user",
                    "content": f"skills user wants to learn: {body.skillsToLearn}, skills user already knows: {body.knownSkills}",
                },
            ],
            temperature=0.7,
        )
        end = perf_counter()
        logger.info(f"Finished ai request | DURATION - {end - start}s")
        content = completion.choices[0].message.content or "{}"
        parsed = json.loads(content)
        skills = parsed.get("skills", parsed if isinstance(parsed, list) else [])
        return {"AIReport": json.dumps(skills)}
    except Exception as error:
        logger.error("Failed to make ai request", exc_info=True)
        raise HTTPException(status_code=500, detail=str(error))
