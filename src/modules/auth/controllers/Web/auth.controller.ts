import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthGuard } from '../../../../common/guards/auth.guard';
import { CurrentUser } from '../../../user/decorators/current-user.decorator';
import { User } from '../../../user/user.entity';
import { AuthService } from '../../auth.service';
import { LoginDto } from '../../dto/request/login.dto';
import { RegisterDto } from '../../dto/request/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('login')
  loadLoginView(@Res() res: Response) {
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

  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Session() session: Record<string, any>,
  ) {
    if (session.userId) {
      throw new BadRequestException(
        'User already login, please logout first to login again',
      );
    }

    const user = await this.authService.register(body);
    if (!user) {
      throw new BadRequestException('Registration failed');
    }
    session.userId = user.id;

    return user;
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Session() session: Record<string, any>) {
    if (session.userId) {
      throw new BadRequestException(
        'User already login, please logout first to login again',
      );
    }

    const user = await this.authService.login(body.email, body.password);
    if (!user) {
      throw new BadRequestException('Login failed');
    }
    session.userId = user.id;

    return user;
  }

  @Get('user')
  @UseGuards(AuthGuard)
  authUser(@CurrentUser() user: User) {
    return user;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@Session() session: Record<string, any>) {
    session.userId = null;
    return { message: 'logout successfully' };
  }
}
