import { HttpException, HttpStatus } from '@nestjs/common';

export class FormValidationException extends HttpException {
  constructor(message: string = 'Form validation failed') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}