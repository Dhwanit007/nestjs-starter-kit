import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { EmployeeService } from 'src/modules/employee/employee.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class ViewLocalsMiddleware implements NestMiddleware {
  constructor(private employeeService: EmployeeService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const path = (req.originalUrl || req.url || '').toString();

    // treat common public/static and auth routes as allowed without session
    const publicPrefixes = ['/login', '/register', '/forgotpassword'];

    const isPublic = publicPrefixes.some((p) => path.startsWith(p));
    const isApi =
      path.startsWith('/api') ||
      (req.headers &&
        String(req.headers.accept || '').includes('application/json')) ||
      (req as any).xhr;

    if (!req.session?.userId) {
      // If this is not an API or public/resource request, redirect to login
      if (!isPublic && !isApi) {
        return res.redirect('/login');
      }
      res.locals.authUser = null;
    } else {
      // load authenticated user for views
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.locals.authUser = await this.employeeService.getById(
        (req.session as any).userId,
      );
    }
    res.locals.error = req.flash('error') || [];
    res.locals.oldInput = req.flash('oldInput') || [];
    res.locals.currentUrl = req.originalUrl || req.url;
    res.locals.toast = req.flash('toast') || [];
    next();
  }
}
