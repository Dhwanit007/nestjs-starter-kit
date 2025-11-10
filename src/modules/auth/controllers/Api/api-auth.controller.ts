import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RegisterDto } from '../../dto/request/register.dto';
import { UserAuthDto } from '../../dto/response/user-auth.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AuthService } from '../../auth.service';
import { LoginDto } from '../../dto/request/login.dto';
import { CurrentUser } from 'src/modules/user/decorators/current-user.decorator';
import { User } from 'src/modules/user/user.entity';
import { UserDetailDto } from '../../dto/response/user-detail.dto';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('api/auth')
export class ApiAuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Serialize(UserAuthDto)
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body);
    if (!user) {
      throw new BadRequestException('Registration failed');
    }
    return user;
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @Serialize(UserAuthDto)
  async login(@Body() body: LoginDto, @CurrentUser() user: User) {
    console.log('login  hit', typeof user);
    console.log(body);
    user.accessToken = await this.authService.generateAccessToken(user);
    return { message: 'Login successful', payload: user };
  }

  @Get('user')
  @Serialize(UserDetailDto)
  @UseGuards(JwtAuthGuard)
  authUser(@CurrentUser() user: User) {
    return user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req: ExpressRequest) {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('logout hit', token);
    if (token) {
      await this.authService.revokeToken(req); // mark in DB/Redis
    }
    return { message: 'logout successfully' };
  }
}
