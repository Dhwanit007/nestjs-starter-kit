import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { EmployeeService } from 'src/modules/employee/employee.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class ViewLocalsMiddleware implements NestMiddleware {
  constructor(private employeeService: EmployeeService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.session?.userId) {
      res.locals.authUser = await this.employeeService.getById(
        req.session.userId,
      );
    } else {
      res.locals.authUser = null;
    }
    res.locals.error = req.flash('error') || [];
    res.locals.oldInput = req.flash('oldInput') || [];
    res.locals.toast = req.flash('toast') || [];
    next();
  }
}
