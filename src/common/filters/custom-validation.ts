import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { FormValidationException } from './custom-validation.exception';
import { Request, Response } from 'express';

@Catch(FormValidationException)
export class FormValidationExceptionFilter implements ExceptionFilter {
  catch(exception: FormValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();

    console.log(
      '📌 FormValidationException handled:',
      {
        url: req.url,
        body: req.body,
        message: exception.message,
      }
    );

    // DO NOT SEND ANY RESPONSE — redirect is handled in the pipe
  }
}
