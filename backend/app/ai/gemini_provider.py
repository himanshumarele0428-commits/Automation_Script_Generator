import google.generativeai as genai
from app.ai.base import BaseLLMProvider


class GeminiProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: str = "gemini-2.0-flash"):
        super().__init__(api_key, model)
        genai.configure(api_key=self.api_key)

    async def generate(self, system_prompt: str, user_prompt: str, **kwargs) -> str:
        combined = f"{system_prompt}\n\n{user_prompt}"
        model = genai.GenerativeModel(self.model)
        generation_config = {}
        if kwargs.get("temperature") is not None:
            generation_config["temperature"] = kwargs["temperature"]
        if kwargs.get("top_p") is not None:
            generation_config["top_p"] = kwargs["top_p"]
        if kwargs.get("max_tokens") is not None:
            generation_config["max_output_tokens"] = kwargs["max_tokens"]

        response = model.generate_content(combined, generation_config=genai.GenerationConfig(**generation_config) if generation_config else None)
        return response.text or ""
