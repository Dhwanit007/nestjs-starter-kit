import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { Observable, map } from 'rxjs';

interface ClassConstructor<T = any> {
  new (...args: any[]): T;
}

export function Serialize<T>(dto?: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto?: ClassConstructor<T>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        if (!this.dto) return data;

        if (data && typeof data === 'object' && Array.isArray(data.data)) {
          const transformedData = data.data.map((item) =>
            //@ts-ignore
            plainToInstance(this.dto, item, { excludeExtraneousValues: true }),
          );
          return {
            ...data,
            data: transformedData,
          };
        }

        if (data && typeof data === 'object' && Array.isArray(data.data)) {
          const transformed = plainToInstance(this.dto, data.data, {
            excludeExtraneousValues: true,
          });

          return { ...data, data: transformed };
        }

        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
