import { http } from './http';
import type { UserProfile } from './users';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  phone?: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await http.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const { data } = await http.post<AuthResponse>('/auth/register', payload);
  return data;
};

export const refresh = async (refreshToken: string): Promise<AuthResponse> => {
  const { data } = await http.post<AuthResponse>('/auth/refresh', { refreshToken });
  return data;
};
