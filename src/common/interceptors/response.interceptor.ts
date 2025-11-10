import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseUtil } from '../utils/response.util';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in our consistent format, return as-is
        if (this.isConsistentResponse(data)) {
          return data;
        }

        // Otherwise, wrap it in our success response
        return ResponseUtil.success(data);
      }),
    );
  }

  private isConsistentResponse(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      'requestId' in data &&
      'result' in data &&
      'statusCode' in data &&
      'message' in data &&
      'payload' in data
    );
  }
}
