from os import getenv
from openai import AsyncOpenAI
from logger import logger

_client: AsyncOpenAI | None = None


def get_ai_client() -> AsyncOpenAI:
    global _client
    if _client is not None:
        return _client

    api_key = getenv("OPENAI_API_KEY")
    if not api_key:
        logger.error("Failed to get openai api_key", exc_info=True)
        raise RuntimeError("Failed to get openai api_key")

    _client = AsyncOpenAI(api_key=api_key, timeout=25.0, max_retries=2)
    return _client
