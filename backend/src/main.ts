import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const bootstrapLogger = new Logger('Bootstrap');

  app.useLogger(bootstrapLogger);

  // enable global validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  try {
    const dataSource = app.get(DataSource, { strict: false });
    if (!dataSource) {
      bootstrapLogger.warn('Data source is not available. Database connection status is unknown.');
    } else {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }
      bootstrapLogger.log(
        `Database connection to "${dataSource.options.database}" established successfully.`,
        'Database',
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    bootstrapLogger.error(`Failed to connect to the database: ${message}`, stack);
    process.exit(1);
  }

  const config = new DocumentBuilder()
    .setTitle('Slipknot Shop API')
    .setDescription('REST API для интернет-магазина мерча группы Slipknot')
    .setVersion('1.0.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Передавайте access токен в формате: Bearer <token>',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  const url = await app.getUrl();
  bootstrapLogger.log(`Application is running on ${url}`);
}
bootstrap();
