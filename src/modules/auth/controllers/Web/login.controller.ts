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
import { Response } from 'express';
import { AuthService } from '../../auth.service';
import { LoginDto } from '../../dto/request/login.dto';
import { AuthGuard } from 'src/guards/auth.guard';

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
      message: [],
      error: ['Invalid email or password'],
    });
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Session() session, @Res() res: Response) {
    session.userId = null;
    return res.redirect('/login');
  }
}
