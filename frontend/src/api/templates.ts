import api from './axios';
import type { Template } from '../types/template';

export const templatesApi = {
  list: () => api.get<Template[]>('/templates'),
  create: (data: Partial<Template>) => api.post<Template>('/templates', data),
  update: (id: string, data: Partial<Template>) => api.put<Template>(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`),
};
