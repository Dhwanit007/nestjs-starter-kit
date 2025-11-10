import { ValidationError } from '@nestjs/common';

export function formatErrors(errors: ValidationError[]) {
  const result: Record<string, string[]> = {};
  errors.forEach((err) => {
    if (err.constraints) {
      result[err.property] = Object.values(err.constraints);
    }
  });
  return result;
}
