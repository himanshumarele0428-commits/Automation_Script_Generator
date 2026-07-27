from app.ai.base import BaseLLMProvider

DEFAULT_MODELS = {
    "groq": "llama-3.3-70b-versatile",
    "openai": "gpt-4o",
    "gemini": "gemini-2.0-flash",
}


def get_provider(name: str, api_key: str, model: str | None = None) -> BaseLLMProvider:
    if model is None:
        model = DEFAULT_MODELS.get(name.lower(), "gpt-4o")

    if name.lower() == "groq":
        from app.ai.groq_provider import GroqProvider
        return GroqProvider(api_key, model)
    elif name.lower() == "openai":
        from app.ai.openai_provider import OpenAIProvider
        return OpenAIProvider(api_key, model)
    elif name.lower() == "gemini":
        from app.ai.gemini_provider import GeminiProvider
        return GeminiProvider(api_key, model)
    else:
        raise ValueError(f"Unknown AI provider: {name}. Choose from: groq, openai, gemini")
