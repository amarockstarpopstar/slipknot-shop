import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const buildTypeOrmOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const portValue = configService.get<string>('DB_PORT');
  const port = portValue ? Number.parseInt(portValue, 10) : 5432;

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: Number.isNaN(port) ? 5432 : port,
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: true,
  };
};
