from os import getenv
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# openai integration

def init_ai():
    api_key = getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("Failed to get openai api_key")
    client = OpenAI(api_key=api_key)
   
    return client




