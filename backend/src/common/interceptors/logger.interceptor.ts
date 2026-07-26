import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;
        const response = ctx.getResponse<Response>();
        const statusCode = response.statusCode;
        this.logger.log(`${method} ${url} ${statusCode} - ${ms}ms`);
      }),
      catchError((err: unknown) => {
        const ms = Date.now() - now;
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`${method} ${url} failed - ${ms}ms: ${message}`);
        return throwError(() => err);
      }),
    );
  }
}
