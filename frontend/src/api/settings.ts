import api from './axios';

export interface AISettings {
  default_provider: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
  configured_providers: string[];
}

export const settingsApi = {
  getAI: () => api.get<AISettings>('/settings/ai'),
  setApiKey: (provider: string, api_key: string) => api.post('/settings/api-keys', { provider, api_key }),
  deleteApiKey: (provider: string) => api.delete(`/settings/api-keys/${provider}`),
};
