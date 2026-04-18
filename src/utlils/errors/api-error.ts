import { HttpException, HttpStatus, Logger } from '@nestjs/common';

export class ApiError extends HttpException {
  private static logger = new Logger('ApiError');

  constructor(statusCode: HttpStatus, message: string) {
    super(
      {
        statusCode,
        message,
        success: false,
      },
      statusCode,
    );

    // 🔥 auto log whenever error is created
    ApiError.logger.error(
      `STATUS: ${statusCode} | MESSAGE: ${message}`,
      this.stack,
    );
  }
}