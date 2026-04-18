import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiError } from './utlils/errors/api-error';

@Injectable()
export class AppService {
  getHello(): string {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Hello World!');
  }
}
