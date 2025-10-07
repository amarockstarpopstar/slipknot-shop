import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined;
    return (
      data?.message ||
      (Array.isArray(data?.errors) ? data?.errors.join(', ') : undefined) ||
      'Произошла ошибка при обращении к серверу'
    );
  }
  return 'Не удалось выполнить запрос';
};
