import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User } from '../types/auth';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; username: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((res) => { setUser(res.data); localStorage.setItem('user', JSON.stringify(res.data)); })
        .catch(() => { setToken(null); setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { access_token, user: u } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(access_token);
    setUser(u);
  }, []);

  const signup = useCallback(async (data: { email: string; username: string; password: string; full_name?: string }) => {
    const res = await authApi.signup(data);
    const { access_token, user: u } = res.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(access_token);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data: Partial<User>) => {
    const res = await authApi.updateMe(data);
    setUser(res.data);
    localStorage.setItem('user', JSON.stringify(res.data));
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
