from fastapi import HTTPException,APIRouter
from core.openai import ai_client
from logger import logger 
from time import perf_counter
router = APIRouter(prefix="/profile", tags=["profile"])

@router.post('/skills')
async def createAiSkillsSuggestions(skillsToLearn:list[str],knownSkills:list[str]):
    logger.info("API profile/skills")
    prompt =  """
You are an AI Skill Recommender for a learning app.

Your task:
Based on the user's known skills and desired skills, suggest new related skills
that would be a natural next step to learn or improve.
You should analyze patterns, industry trends, and logical skill progressions.

Guidelines:
1. Output must be a **pure JSON array of strings**, e.g.:
   ["Machine Learning", "GraphQL", "Docker", "UI Design"]
2. Each skill name should be short, specific, and relevant.
3. Suggest **exactly 5 skills**.
4. If the user provided no skills, suggest the most popular/trending skills for modern tech and design.
5. Do not include explanations, descriptions, or any extra text — only valid JSON.

Example:
Input:
knownSkills: ["HTML", "CSS", "JavaScript"]
skillsToLearn: ["React", "Node.js"]

Output:
["TypeScript", "Redux", "REST API Design", "Express.js", "MongoDB", "Next.js"]

     """
    # configuration for gpt requests   
    try:
        start =perf_counter()
        logger.info("Starting ai request")
        completion = ai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
                {"role": "system", "content": prompt},
                {"role": "user",    "content": f"""
                skills user wants to learn: {skillsToLearn},
                 skills user already knows: {knownSkills}
                """ }
            ],
        temperature=0.7
        )
        end =perf_counter()
        logger.info(f"Finished ai request | DURATION - {end-start}s")
        
        return {"AIReport": completion.choices[0].message.content}
    except Exception as error:
        logger.error("Failed to make ai request", exc_info=True)
        raise HTTPException(status_code=500,detail=str(error))


    