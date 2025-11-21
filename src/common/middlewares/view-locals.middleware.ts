import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';

@Injectable()
export class ViewLocalsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // res.locals.authUser = req.user;
    res.locals.error = req.flash('error');
    // res.locals.oldInput = req.body;
    // console.log(req.flash('toast'))
    res.locals.toast = req.flash('toast');
    // console.log(res.locals.toast);
    next();
  }
}
