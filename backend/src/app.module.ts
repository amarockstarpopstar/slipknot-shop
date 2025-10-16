import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { SizesModule } from './modules/sizes/sizes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderStatusesModule } from './modules/order-statuses/order-statuses.module';
import { CartsModule } from './modules/carts/carts.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { buildTypeOrmOptions } from './config/typeorm.config';
import { AuditContextService } from './common/audit/audit-context.service';
import { AuditContextInterceptor } from './common/audit/audit-context.interceptor';
import { AuditSubscriber } from './common/audit/audit.subscriber';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        buildTypeOrmOptions(configService),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    SizesModule,
    OrdersModule,
    OrderStatusesModule,
    CartsModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuditContextService,
    AuditSubscriber,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditContextInterceptor,
    },
  ],
})
export class AppModule {}
