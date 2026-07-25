import api from './axios';
import type { LoginRequest, SignupRequest, TokenResponse, User } from '../types/auth';

export const authApi = {
  login: (data: LoginRequest) => api.post<TokenResponse>('/auth/login', data),
  signup: (data: SignupRequest) => api.post<TokenResponse>('/auth/signup', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, new_password: string) => api.post('/auth/reset-password', { token, new_password }),
  getMe: () => api.get<User>('/users/me'),
  updateMe: (data: Partial<User>) => api.put<User>('/users/me', data),
};
