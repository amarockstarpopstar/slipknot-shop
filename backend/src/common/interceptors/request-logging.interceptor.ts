import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';

// interceptor that logs every incoming HTTP request and response
@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const { method, originalUrl } = request;
    const startedAt = Date.now();

    this.logger.log(`➡️  ${method} ${originalUrl}`);

    return next.handle().pipe(
      tap(() => {
        const response = httpContext.getResponse<Response>();
        const statusCode = response.statusCode;
        const duration = Date.now() - startedAt;
        this.logger.log(`⬅️  ${method} ${originalUrl} ${statusCode} +${duration}ms`);
      }),
      catchError((error) => {
        const duration = Date.now() - startedAt;
        const statusCode = (error && (error.status || error.statusCode)) ?? 500;
        const message = error?.message ?? 'Internal server error';
        this.logger.error(`💥 ${method} ${originalUrl} ${statusCode} +${duration}ms :: ${message}`, error?.stack);
        return throwError(() => error);
      }),
    );
  }
}
