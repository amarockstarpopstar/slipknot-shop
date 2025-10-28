import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

export const resolveApiUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed) || trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    return new URL(trimmed, API_URL).toString();
  } catch {
    return trimmed;
  }
};

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
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return `Не удалось подключиться к серверу. Проверьте, что backend запущен и доступен по адресу ${API_URL}.`;
      }
      return 'Не удалось связаться с сервером. Проверьте подключение к сети.';
    }
    const data = error.response?.data as ApiError | undefined;
    return (
      data?.message ||
      (Array.isArray(data?.errors) ? data?.errors.join(', ') : undefined) ||
      'Произошла ошибка при обращении к серверу'
    );
  }
  return 'Не удалось выполнить запрос';
};
