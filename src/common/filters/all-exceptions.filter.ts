import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

import { ApiResponse } from '../interfaces/api-response.interface';
import { ResponseUtil } from '../utils/response.util';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = randomUUID();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let payload: any = null;

    // Log the exception for debugging
    // this.logException(exception, request, requestId);

    const isApi = request.url.startsWith('/api');

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      // Check if the response is already in our desired format
      if (this.isConsistentResponse(exceptionResponse)) {
        status = exceptionResponse.statusCode || status;
        return response.status(status).json(exceptionResponse);
      }

      // Extract message and payload from HttpException
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || message;
        // console.log((exceptionResponse as any).message);
        payload = (exceptionResponse as any).payload || exceptionResponse;
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
      payload = {
        name: exception.name,
        stack:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    if (status === 404 && !isApi) {
      // Rendering EJS page for non-API 404
      return response.status(404).render('auth/auth-404', {
        layout: 'layouts/layout-without-nav',
        title: '404',
        page_title: 'Not Found',
        folder: 'auth',
      });
    }

    // Create consistent error response based on status code
    const errorResponse = this.createErrorResponse(
      status,
      message,
      null,
      requestId,
    );
    if (response.headersSent) {
      return; // prevents Nest from logging ERR_HTTP_HEADERS_SENT
    }

    response.status(status).json(errorResponse);
  }

  private isConsistentResponse(response: any): response is ApiResponse {
    return (
      typeof response === 'object' &&
      response !== null &&
      'requestId' in response &&
      'result' in response &&
      'statusCode' in response &&
      'message' in response &&
      'payload' in response
    );
  }

  private createErrorResponse(
    statusCode: number,
    message: string,
    payload: any,
    requestId: string,
  ) {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return ResponseUtil.error(message, 200, payload, requestId);
      case HttpStatus.UNAUTHORIZED:
        return ResponseUtil.unauthorized(message, payload, requestId);
      case HttpStatus.FORBIDDEN:
        return ResponseUtil.forbidden(message, payload, requestId);
      case HttpStatus.NOT_FOUND:
        return ResponseUtil.notFound(message, payload, requestId);
      case HttpStatus.GATEWAY_TIMEOUT:
        return ResponseUtil.gatewayTimeout(message, payload, requestId);
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return ResponseUtil.serverError(
          message,
          statusCode,
          payload,
          requestId,
        );
    }
  }

  // private logException(
  //   exception: unknown,
  //   request: Request,
  //   requestId: string,
  // ) {
  //   const { method, url, ip, headers } = request;
  //   const userAgent = headers['user-agent'] || '';

  //   this.logger.error(`Exception occurred - RequestId: ${requestId}`, {
  //     exception: exception instanceof Error ? exception.stack : exception,
  //     request: {
  //       method,
  //       url,
  //       ip,
  //       userAgent,
  //     },
  //   });
  // }
}
