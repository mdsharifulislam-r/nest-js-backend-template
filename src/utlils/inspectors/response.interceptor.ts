import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => {
        const message = data?.message || 'Request successful';
        const statusCode = data?.statusCode || 200;
        const pagination = data?.pagination;
        delete data?.pagination;
        delete data?.statusCode;
        delete data?.message;
        return {
        success: true,
        message: message,
        statusCode: statusCode,
        ...(pagination && { pagination }),
        ...(data?.data && { data: data?.data }),
      }
      }),
    );
  }
}