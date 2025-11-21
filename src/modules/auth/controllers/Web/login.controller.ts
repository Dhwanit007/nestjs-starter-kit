import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/common/guards/auth.guard';

import { AuthService } from '../../auth.service';
import { LoginDto } from '../../dto/request/login.dto';

@Controller()
export class LoginController {
  constructor(private authService: AuthService) {}
  @Get('login')
  loadLoginView(@Session() session, @Res() res: Response) {
    if (session.userId) {
      return res.redirect('/');
    }
    return res.render('auth/login', {
      title: 'Login',
      page_title: 'Login',
      folder: 'Authentication',
      layout: 'layouts/layout-without-nav',
      data: {
        hello: 'world',
      },
      message: [],
      error: [],
    });
  }

  @Post('login')
  async login(
    @Body() body: any,
    @Session() session: Record<string, any>,
    @Req() req: any,
    @Res() res: Response,
  ) {
    if (session.userId) return res.redirect('/');

    const { email, password } = body;

    const user = await this.authService.validateUser(email, password);

    if (user) {
      session.userId = user.id;
      req.flash('toast', 'Successfully Logged in');
      return res.redirect('/');
    }

    return res.render('auth/login', {
      title: 'Login',
      page_title: 'Login',
      folder: 'Authentication',
      layout: 'layouts/layout-without-nav',
      oldInputs: {
        email: body.email,
        password: body.password,
      },
      message: res.locals.toast,
      error: ['Invalid email or password'],
    });
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Session() session, @Res() res: Response, @Req() req: Request) {
    session.userId = null;
    req.flash('toast', 'Logout Successful');
    return res.redirect('/login');
  }

  // @Post('logout')
  // @UseGuards(AuthGuard)
  // logout(@Session() session, @Res() res: Response, @Req() req: Request) {
  //   session.userId = null;
  //   req.flash('toast', 'Logout Successful');

  //   session.save(() => {
  //     return res.redirect('/login');
  //   });
  // }
}
