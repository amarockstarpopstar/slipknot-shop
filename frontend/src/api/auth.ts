import { http } from './http';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: {
      id: number;
      name: string;
    } | null;
  };
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
