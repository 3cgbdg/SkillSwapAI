from os import getenv
from dotenv import load_dotenv
from openai import OpenAI
from logger import logger
load_dotenv()

# openai integration

def init_ai():
    api_key = getenv("OPENAI_API_KEY")
    if not api_key:
        logger.error("Failed to get openai api_key", exc_info=True)
        raise RuntimeError("Failed to get openai api_key")
    client = OpenAI(api_key=api_key)
   
    return client

ai_client = init_ai()




