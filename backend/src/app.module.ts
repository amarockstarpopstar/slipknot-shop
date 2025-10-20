import { Injectable, Module, OnApplicationBootstrap } from '@nestjs/common';
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
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { buildTypeOrmOptions } from './config/typeorm.config';
import { AuditContextService } from './common/audit/audit-context.service';
import { AuditContextInterceptor } from './common/audit/audit-context.interceptor';
import { AuditSubscriber } from './common/audit/audit.subscriber';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseConnectionLogger implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  public async onApplicationBootstrap(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    console.log('✅ Connected to local PostgreSQL successfully!');

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const result: Array<{ table_name: string }> = await queryRunner.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name",
      );
      const tableList = result.map(({ table_name }) => table_name);
      console.log(
        `📦 Public tables: ${tableList.length > 0 ? tableList.join(', ') : 'none'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}

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
    ReviewsModule,
    AuditLogModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuditContextService,
    AuditSubscriber,
    DatabaseConnectionLogger,
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
