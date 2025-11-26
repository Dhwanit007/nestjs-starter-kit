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
} from '@nestjs/common';
import * as crypto from 'crypto';
import { Response } from 'express';
import { CreateEmployeeDto } from 'src/modules/employee/dto/create-employee.dto';
import { EmployeeService } from 'src/modules/employee/employee.service';
import { promisify } from 'util';

import { AuthGuard } from '../../../../common/guards/auth.guard';
import { CurrentUser } from '../../../user/decorators/current-user.decorator';
import { User } from '../../../user/user.entity';
import { AuthService } from '../../auth.service';
import { LoginDto } from '../../dto/request/login.dto';
import { RegisterDto } from '../../dto/request/register.dto';

const scrypt = promisify(crypto.scrypt);

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
  ) {}
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
    @Body() body: CreateEmployeeDto,
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
  async login(
    @Body() body: LoginDto,
    @Res() res,
    @Req() req,
    @Session() session: Record<string, any>,
  ) {
    const { email, password } = body;

    // 1. Find employee
    const user = await this.employeeService.findByEmail(email);
    if (!user) {
      req.flash('toast', {
        type: 'error',
        message: 'Invalid email',
      });
      return res.redirect('/login');
    }

    // 2. Check admin role
    if (user.role !== 'Admin') {
      req.flash('toast', { type: 'error', message: 'Only admin can login' });
      return res.redirect('/login');
    }

    // 3. Validate password
    const [salt, storedHash] = user.password.split(':');
    const derived = (await scrypt(password, salt, 64)) as Buffer;

    if (storedHash !== derived.toString('hex')) {
      req.flash('toast', {
        type: 'error',
        message: 'Invalid email or password',
      });
      return res.redirect('/login');
    }

    // 4. Store user session + flash success
    req.session.userId = user.id;
    req.flash('toast', 'Successfully Logged in');

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    // 5. Redirect to dashboard
    return res.redirect('/');
    // return res.json({ success: true, user });
  }

  // @Post('login')
  // async login(@Body() body: LoginDto, @Session() session: Record<string, any>) {
  //   if (session.userId) {
  //     throw new BadRequestException(
  //       'User already login, please logout first to login again',
  //     );
  //   }

  //   const user = await this.authService.login(body.email, body.password);
  //   if (!user) {
  //     throw new BadRequestException('Login failed');
  //   }
  //   session.userId = user.id;

  //   return user;
  // }

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
