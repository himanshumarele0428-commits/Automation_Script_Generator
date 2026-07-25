from openai import AsyncOpenAI
from app.ai.base import BaseLLMProvider


class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        super().__init__(api_key, model)

    async def generate(self, system_prompt: str, user_prompt: str, **kwargs) -> str:
        client = AsyncOpenAI(api_key=self.api_key)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]
        params = {"model": self.model, "messages": messages}
        if kwargs.get("temperature") is not None:
            params["temperature"] = kwargs["temperature"]
        if kwargs.get("top_p") is not None:
            params["top_p"] = kwargs["top_p"]
        if kwargs.get("max_tokens") is not None:
            params["max_tokens"] = kwargs["max_tokens"]

        response = await client.chat.completions.create(**params)
        return response.choices[0].message.content or ""
