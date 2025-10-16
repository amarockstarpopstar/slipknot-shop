import { http } from './http';

export interface AuditLogEntry {
  id: number;
  tableName: string;
  recordId: number | null;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  userId: number | null;
  actorName: string;
  createdAt: string;
}

export interface AuditLogListResponse {
  items: AuditLogEntry[];
  offset: number;
  limit: number;
  total: number;
}

export const fetchAuditLog = async (params: {
  limit?: number;
  offset?: number;
  tableName?: string;
} = {}): Promise<AuditLogListResponse> => {
  const { data } = await http.get<AuditLogListResponse>('/audit-log', { params });
  return data;
};
