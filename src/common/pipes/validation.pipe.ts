import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { randomUUID } from 'crypto';
import { Request } from 'express';

import { FormValidationException } from '../filters/custom-validation.exception';
import { ValidationError } from '../interfaces/api-response.interface';
import { ResponseUtil } from '../utils/response.util';

@Injectable({ scope: Scope.REQUEST })
export class CustomValidationPipe implements PipeTransform<any> {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    if (value && value.constructor === metatype) return value;
    if (value === undefined || value === null) return value;

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      // Format errors
      const formattedErrors: Record<string, string[]> = {};
      errors.forEach((err) => {
        formattedErrors[err.property] = Object.values(err.constraints || {});
      });

      const isApi = this.request.url.startsWith('/api');

      console.log(formattedErrors, 'formatted');
      console.log(errors, 'errors');
      if (isApi) {
        // For API -> throw JSON error
        throw new BadRequestException({
          requestId: randomUUID(),
          result: false,
          statusCode: 400,
          message: 'Validation failed',
          payload: formattedErrors,
        });
      } else {
        // For HTML -> store errors and old inputs in flash
        this.request.flash('error', formattedErrors);
        this.request.flash('oldInput', this.request.body);

        const referer = this.request.get('Referer') || '/';
        if (!this.request.res?.headersSent) {
          this.request.res?.redirect(referer);
        }
        throw new FormValidationException();
        return; // stop further processing
      }
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
