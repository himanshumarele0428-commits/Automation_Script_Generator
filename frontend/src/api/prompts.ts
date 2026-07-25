import api from './axios';
import type { Prompt } from '../types/prompt';

export const promptsApi = {
  list: () => api.get<Prompt[]>('/prompts'),
  create: (data: Partial<Prompt>) => api.post<Prompt>('/prompts', data),
  update: (id: string, data: Partial<Prompt>) => api.put<Prompt>(`/prompts/${id}`, data),
  delete: (id: string) => api.delete(`/prompts/${id}`),
};
