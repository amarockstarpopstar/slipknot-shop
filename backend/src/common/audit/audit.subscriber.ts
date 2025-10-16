import { Injectable, Logger } from '@nestjs/common';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AuditContextService } from './audit-context.service';

// subscriber that propagates audit context to PostgreSQL session
@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger('AuditSubscriber');

  constructor(
    private readonly dataSource: DataSource,
    private readonly auditContextService: AuditContextService,
  ) {
    this.dataSource.subscribers.push(this);
  }

  listenTo(): Function {
    return Object;
  }

  async beforeInsert(event: InsertEvent<unknown>): Promise<void> {
    await this.applyContext(event);
  }

  async beforeUpdate(event: UpdateEvent<unknown>): Promise<void> {
    await this.applyContext(event);
  }

  async beforeRemove(event: RemoveEvent<unknown>): Promise<void> {
    await this.applyContext(event);
  }

  private async applyContext(
    event: InsertEvent<unknown> | UpdateEvent<unknown> | RemoveEvent<unknown>,
  ): Promise<void> {
    const userId = this.auditContextService.getCurrentUserId();
    try {
      await event.queryRunner.query('SELECT set_current_app_user($1)', [userId ?? null]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to set current app user for audit: ${message}`);
    }
  }
}
