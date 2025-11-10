import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';

export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const res: Response = context.switchToHttp().getResponse<Response>();
    if (request.session && request.session.userId) {
      return true;
    }
    res.redirect('/login');
    return false;
  }
}
