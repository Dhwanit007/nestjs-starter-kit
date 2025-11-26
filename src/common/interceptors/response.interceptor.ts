import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data: any) => {
        const { message, messageLBL, payload } = this.extractData(data);

        return {
          requestId: randomUUID(),
          success: true,
          code: response.statusCode,
          message: message ?? 'Request successful',
          messageLBL: messageLBL ?? 'SUCCESS',
          payload: this.normalizePayload(payload),
        };
      }),
    );
  }

  private extractData(data: any) {
    if (data && typeof data === 'object') {
      // 🟢 IGNORE success so it doesn't go to payload
      const { message, messageLBL, success, ...rest } = data;

      return {
        message,
        messageLBL,
        payload: Object.keys(rest).length ? rest : null,
      };
    }

    return {
      message: undefined,
      messageLBL: undefined,
      payload: data,
    };
  }

  private normalizePayload(payload: any) {
    if (payload === undefined || payload === null) return null;

    if (typeof payload === 'object' && !Array.isArray(payload)) {
      if (Object.keys(payload).length === 0) return null;
    }

    return payload;
  }
}
