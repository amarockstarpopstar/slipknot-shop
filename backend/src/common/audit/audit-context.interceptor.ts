import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditContextService } from './audit-context.service';
import { Request } from 'express';

type RequestWithUser = Request & { user?: { userId?: number } };

// interceptor that populates audit context with current user id
@Injectable()
export class AuditContextInterceptor implements NestInterceptor {
  constructor(private readonly auditContextService: AuditContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<RequestWithUser>();
    const userId = request?.user?.userId;

    return new Observable((subscriber) => {
      this.auditContextService.runInContext({ userId }, () => {
        const observable = next.handle();
        observable.subscribe({
          next: (value) => subscriber.next(value),
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
