import {
  NestInterceptor,
  UseInterceptors,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

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
        return plainToInstance(
          this.dto as ClassConstructor<T>,
          data,
          this.dto ? { excludeExtraneousValues: true } : {},
        );
      }),
    );
  }
}
