from fastapi import HTTPException,APIRouter
from ..main import client

router = APIRouter(prefix="/profile", tags=["profile"])

@router.post('/skills')
async def createAiSkillsSuggestions(skillsToLearn:list[str],knownSkills:list[str]):
    prompt =  """
  You are an AI Skill Recommender for a learning app.

Your task:
Based on the user's known skills and desired skills, suggest new related skills
that would be a natural next step to learn or improve.
You should analyze patterns, industry trends, and logical skill progressions.

Guidelines:
1. Output must be a **pure JSON array of strings**, e.g.:
   ["Machine Learning", "GraphQL", "Docker", "UI Design"]
2. Each skill name should be short, specific, and relevant to the given skills.
3. Suggest **exactly 5 skills** that would be valuable to learn next.
4. Focus on realistic and modern skills that complement both what the user knows and wants to learn.
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
        completion = client.chat.completions.create(
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
        return {"AIReport": completion.choices[0].message.content}
    except Exception as error:
        raise HTTPException(status_code=500,detail=str(error))


    