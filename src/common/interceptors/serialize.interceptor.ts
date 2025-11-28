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

// for class type validation
interface ClassConstructor<T = any> {
  new (...args: any[]): T;
}

// custom decorator
export function Serialize<T>(dto?: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto?: ClassConstructor<T>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        // If the controller returns a wrapper object like { data: [...] },
        // transform the inner array elements into DTO instances and
        // preserve the wrapper shape. This avoids circular/correct
        // serialization when using DataTables or similar frontends.
        if (
          this.dto &&
          data &&
          typeof data === 'object' &&
          Array.isArray(data.data)
        ) {
          const transformedArray = plainToInstance(
            this.dto as ClassConstructor<T>,
            data.data,
            { excludeExtraneousValues: true },
          );
          return { ...data, data: transformedArray };
        }

        return plainToInstance(
          this.dto as ClassConstructor<T>,
          data,
          this.dto ? { excludeExtraneousValues: true } : {},
        );
      }),
    );
  }
}
