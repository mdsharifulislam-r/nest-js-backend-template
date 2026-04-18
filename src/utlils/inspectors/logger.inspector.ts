import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || 'unknown';

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;

        this.logger.log(
          `${method} ${originalUrl} | ${req.res.statusCode} | ${duration}ms | IP: ${ip} | UA: ${userAgent}`,
        );
      }),

      catchError((err) => {
        const duration = Date.now() - start;

        this.logger.error(
          `${method} ${originalUrl} | ERROR | ${duration}ms | IP: ${ip} | ${err.message}`,
        );

        return throwError(() => err);
      }),
    );
  }
}