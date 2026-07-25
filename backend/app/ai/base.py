from abc import ABC, abstractmethod


class BaseLLMProvider(ABC):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model

    @abstractmethod
    async def generate(self, system_prompt: str, user_prompt: str, **kwargs) -> str:
        ...

    @property
    def provider_name(self) -> str:
        return self.__class__.__name__.replace("Provider", "").lower()
