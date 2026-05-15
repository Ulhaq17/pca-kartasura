import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPaginatedResult, PaginationMeta } from '../pagination/paginated-result';

export interface Response<T> {
  data: T;
  meta: {
    timestamp: string;
    path: string;
    pagination?: PaginationMeta;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => {
        const meta = {
          timestamp: new Date().toISOString(),
          path: request.url,
          ...(isPaginatedResult(data)
            ? { pagination: data.pagination }
            : {}),
        };

        return {
          data: isPaginatedResult<T>(data) ? data.items : data,
          meta,
        };
      }),
    );
  }
}
