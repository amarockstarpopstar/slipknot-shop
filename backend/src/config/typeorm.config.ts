import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const buildTypeOrmOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const portValue = configService.get<string>('DB_PORT');
  const port = portValue ? Number.parseInt(portValue, 10) : 5432;

  const host = configService.get<string>('DB_HOST') || '127.0.0.1';
  const username = configService.get<string>('DB_USER') || 'postgres';
  const password = configService.get<string>('DB_PASSWORD') || 'postgres';
  const database = configService.get<string>('DB_NAME') || 'slipknot_shop';

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
