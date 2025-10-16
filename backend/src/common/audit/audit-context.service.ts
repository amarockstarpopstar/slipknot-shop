import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

type AuditContextStore = {
  userId?: number;
};

// stores current user id in async local storage for audit logging
@Injectable()
export class AuditContextService {
  private readonly storage = new AsyncLocalStorage<AuditContextStore>();

  runInContext<T>(store: AuditContextStore, callback: () => T): T {
    return this.storage.run(store, callback);
  }

  getCurrentUserId(): number | undefined {
    return this.storage.getStore()?.userId;
  }
}
