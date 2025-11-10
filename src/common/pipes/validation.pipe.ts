import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
  Scope,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { ResponseUtil } from '../utils/response.util';
import { ValidationError } from '../interfaces/api-response.interface';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class CustomValidationPipe implements PipeTransform<any> {
  // Inject the request object in the constructor
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const requestId = randomUUID();

      // Format validation errors consistently
      let formattedErrors: ValidationError[] | Record<string, string[]>;

      const isApi = this.request.url.startsWith('/api');
      if (isApi) {
        formattedErrors = errors.map((err) => ({
          field: err.property,
          errors: Object.values(err.constraints || {}),
        }));
      } else {
        formattedErrors = errors.reduce(
          (acc, err) => {
            acc[err.property] = Object.values(err.constraints || {});
            return acc;
          },
          {} as Record<string, string[]>,
        );
      }

      // Get the first error message
      const firstErrorMessage =
        formattedErrors[0]?.errors[0] || 'Validation failed';

      // Create consistent error response
      const errorResponse = ResponseUtil.validationError(
        formattedErrors,
        firstErrorMessage,
        requestId,
      );

      throw new BadRequestException(errorResponse);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
