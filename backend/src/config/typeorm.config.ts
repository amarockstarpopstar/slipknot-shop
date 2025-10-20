import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

const resolveValue = (configService: ConfigService, keys: string[], fallback?: string): string | undefined => {
  for (const key of keys) {
    const value = configService.get<string>(key);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return fallback;
};

export const buildTypeOrmOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const portValue = resolveValue(configService, ['DATABASE_PORT', 'DB_PORT']);
  const port = portValue ? Number.parseInt(portValue, 10) : 5432;

  const host =
    resolveValue(configService, ['DATABASE_HOST', 'DB_HOST']) ?? 'localhost';
  const username =
    resolveValue(configService, ['DATABASE_USER', 'DB_USER']) ?? 'postgres';
  const password =
    resolveValue(configService, ['DATABASE_PASSWORD', 'DB_PASSWORD']) ??
    'postgres';
  const database =
    resolveValue(configService, ['DATABASE_NAME', 'DB_NAME']) ?? 'slipknot_shop';

  return {
    type: 'postgres',
    host,
    port: Number.isNaN(port) ? 5432 : port,
    username,
    password,
    database,
    entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
    autoLoadEntities: true,
    synchronize: true,
  };
};
