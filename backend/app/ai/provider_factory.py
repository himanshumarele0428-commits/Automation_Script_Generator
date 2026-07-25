from app.ai.base import BaseLLMProvider
from app.ai.groq_provider import GroqProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.gemini_provider import GeminiProvider


PROVIDER_MAP = {
    "groq": GroqProvider,
    "openai": OpenAIProvider,
    "gemini": GeminiProvider,
}


def get_provider(name: str, api_key: str, model: str | None = None) -> BaseLLMProvider:
    provider_cls = PROVIDER_MAP.get(name.lower())
    if provider_cls is None:
        raise ValueError(f"Unknown AI provider: {name}. Choose from: {list(PROVIDER_MAP.keys())}")

    default_models = {
        "groq": "llama-3.3-70b-versatile",
        "openai": "gpt-4o",
        "gemini": "gemini-2.0-flash",
    }

    if model is None:
        model = default_models.get(name.lower(), "gpt-4o")

    return provider_cls(api_key, model)
