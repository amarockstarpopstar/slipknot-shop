import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogResponseDto } from './dto/audit-log-response.dto';

// service to fetch audit log entries
@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async findMany(options: {
    limit?: number;
    offset?: number;
    tableName?: string;
  }): Promise<{ items: AuditLogResponseDto[]; total: number }> {
    const { limit = 50, offset = 0, tableName } = options;

    const qb = this.auditRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.user', 'user')
      .orderBy('audit.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (tableName) {
      qb.andWhere('audit.tableName = :tableName', { tableName });
    }

    const [entities, total] = await qb.getManyAndCount();

    const items: AuditLogResponseDto[] = entities.map((entity) => ({
      id: Number(entity.id),
      tableName: entity.tableName,
      recordId: entity.recordId ? Number(entity.recordId) : null,
      operation: entity.operation,
      oldData: entity.oldData,
      newData: entity.newData,
      userId: entity.userId ?? null,
      actorName: entity.user?.name ?? 'Системный пользователь',
      createdAt: entity.createdAt.toISOString(),
    }));

    return { items, total };
  }
}
