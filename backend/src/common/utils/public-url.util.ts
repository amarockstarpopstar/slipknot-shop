import { ConfigService } from '@nestjs/config';
import type { Logger } from '@nestjs/common';

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const PUBLIC_BASE_URL_ENV_KEYS = [
  'APP_PUBLIC_URL',
  'BACKEND_PUBLIC_URL',
  'API_PUBLIC_URL',
  'PUBLIC_BACKEND_URL',
];
const DEFAULT_PUBLIC_BASE_URL = 'http://localhost:3000';

type LoggerLike = Pick<Logger, 'warn'>;

export const resolvePublicBaseUrl = (
  configService: ConfigService,
  logger?: LoggerLike,
): string => {
  for (const key of PUBLIC_BASE_URL_ENV_KEYS) {
    const value = configService.get<string>(key);
    if (!value) {
      continue;
    }

    try {
      const normalized = new URL(value);
      return normalized.toString().replace(/\/$/, '');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger?.warn?.(`Игнорируем некорректное значение ${key}: ${message}`);
    }
  }

  return DEFAULT_PUBLIC_BASE_URL;
};

export const extractPublicOrigin = (url: string): string => {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
};

export const resolvePublicImageUrl = (
  imageUrl: string | null | undefined,
  baseUrl: string,
): string | null => {
  const trimmed = imageUrl?.trim();
  if (!trimmed) {
    return null;
  }

  if (ABSOLUTE_URL_PATTERN.test(trimmed) || trimmed.startsWith('//')) {
    return trimmed;
  }

  try {
    return new URL(trimmed, `${baseUrl}/`).toString();
  } catch {
    return trimmed;
  }
};
