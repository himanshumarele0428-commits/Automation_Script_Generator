import api from './axios';
import type { GenerateRequest, Script, ScriptListItem, HistoryResponse, DashboardStats } from '../types/script';

export const scriptsApi = {
  generate: (data: GenerateRequest) => api.post<Script>('/scripts/generate', data),
  list: (params?: Record<string, string | number | boolean>) => api.get<HistoryResponse>('/scripts', { params }),
  get: (id: string) => api.get<Script>(`/scripts/${id}`),
  delete: (id: string) => api.delete(`/scripts/${id}`),
  toggleFavorite: (id: string) => api.patch<Script>(`/scripts/${id}/favorite`),
  dashboardStats: () => api.get<DashboardStats>('/scripts/stats/dashboard'),
};
