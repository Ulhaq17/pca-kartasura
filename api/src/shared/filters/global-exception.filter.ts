import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '../../../generated/prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorResponse = 'Internal Server Error';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse() as any;
      message = response.message || exception.message;
      errorResponse = response.error || exception.name;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          httpStatus = HttpStatus.CONFLICT;
          message = `Duplicate field value entered: ${exception.meta?.target}`;
          errorResponse = 'Conflict';
          break;
        case 'P2025': // Record not found
          httpStatus = HttpStatus.NOT_FOUND;
          message = (exception.meta?.cause as string) || 'Record not found';
          errorResponse = 'Not Found';
          break;
        case 'P2003': // Foreign key constraint failed
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed on the field';
          errorResponse = 'Bad Request';
          break;
        default:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = exception.message;
          errorResponse = 'Prisma Error';
          break;
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      httpStatus = HttpStatus.BAD_REQUEST;
      message = 'Database validation error';
      errorResponse = 'Bad Request';
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
    }

    const responseBody = {
      statusCode: httpStatus,
      error: errorResponse,
      message: message,
      meta: {
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(request),
      },
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
