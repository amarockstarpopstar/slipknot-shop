import { ApiProperty } from '@nestjs/swagger';

// response dto for audit log entries
export class AuditLogResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'orders' })
  tableName: string;

  @ApiProperty({ example: 42, nullable: true })
  recordId: number | null;

  @ApiProperty({ example: 'UPDATE' })
  operation: 'INSERT' | 'UPDATE' | 'DELETE';

  @ApiProperty({ type: Object, nullable: true })
  oldData: Record<string, unknown> | null;

  @ApiProperty({ type: Object, nullable: true })
  newData: Record<string, unknown> | null;

  @ApiProperty({ example: 5, nullable: true })
  userId: number | null;

  @ApiProperty({ example: 'Алексей Админ' })
  actorName: string;

  @ApiProperty()
  createdAt: string;
}

export class AuditLogListResponseDto {
  @ApiProperty({ type: AuditLogResponseDto, isArray: true })
  items: AuditLogResponseDto[];

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 120 })
  total: number;
}
