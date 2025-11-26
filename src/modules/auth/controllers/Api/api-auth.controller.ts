import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import * as crypto from 'crypto';
import {
  Serialize,
  SerializeInterceptor,
} from 'src/common/interceptors/serialize.interceptor';
import { CreateEmployeeDto } from 'src/modules/employee/dto/create-employee.dto';
import { EmployeeService } from 'src/modules/employee/employee.service';
import { Employee } from 'src/modules/employee/entities/employee.entity';
import { CurrentUser } from 'src/modules/user/decorators/current-user.decorator';
import { promisify } from 'util';

import { AuthService } from '../../auth.service';
import { LoginDto } from '../../dto/request/login.dto';
import { SerializeLogin } from '../../dto/response/login.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('api/auth')
@Serialize(SerializeLogin)
export class ApiAuthController {
  constructor(
    private authService: AuthService,
    private readonly employeeService: EmployeeService,
  ) {}

  private async verifyPassword(stored: string, supplied: string) {
    const [salt, hash] = stored.split(':');
    const derivedKey = (await promisify(crypto.scrypt)(
      supplied,
      salt,
      64,
    )) as Buffer;
    return hash === derivedKey.toString('hex');
  }

  /* -------------------------------------------------------
      REGISTER
  -------------------------------------------------------- */
  // @Post('register')
  // async register(@Body() body: CreateEmployeeDto) {
  //   const existing = await this.employeeService.findByEmail(body.email);

  //   console.log(existing);
  //   if (existing) {
  //     throw new BadRequestException('Email already Exists');
  //   }

  //   const user = await this.employeeService.registeremployee(body);
  //   if (!user) {
  //     throw new BadRequestException();
  //   }

  //   return {
  //     // success: true,
  //     message: 'User registered successfully',
  //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //   };
  // }
  @Post('register')
  async register(@Body() body: CreateEmployeeDto) {
    const existing = await this.employeeService.findByEmail(body.email);
    if (existing) {
      throw new BadRequestException('Email already exists'); // safe
    }

    try {
      const user = await this.employeeService.registeremployee(body);
      if (!user) {
        throw new NotFoundException();
      }
      return {
        message: 'User registered successfully',
        id: user.id,
        name: user.name,
        email: user.email,
      };
    } catch (err) {
      // Catch MySQL duplicate entry in case race condition
      if (err.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('Email already exists');
      }
      throw err; // Re-throw other errors
    }
  }

  /* -------------------------------------------------------
      LOGIN
  -------------------------------------------------------- */
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.employeeService.findByEmail(body.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password manually (EmployeeService hashes it)
    const isPasswordValid = await this.verifyPassword(
      user.password,
      body.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Only Admin can login
    if (user.role !== 'Admin') {
      return {
        success: false,
        message: 'Only Admin can login',
      };
    }

    // Generate access token (call AuthService JWT utility)
    const accessToken = await this.authService.generateAccessToken(user);

    return {
      // success: true,
      message: 'Login successful',
      id: user.id,
      name: user.name,
      email: user.email,
      accessToken,
    };
  }

  /* -------------------------------------------------------
      GET AUTH USER (JWT REQUIRED)
  -------------------------------------------------------- */
  @Get('user')
  @UseGuards(JwtAuthGuard)
  async authUser(@CurrentUser() user: Employee, @Req() req) {
    const payload: any = req.user;

    const valid = await this.authService.validateToken(user, payload.tokenId);

    return {
      // success: valid,
      message: 'Token is valid',
      id: user.id,
      name: user.name,
      email: user.email,
      // user: valid ? user : null,
    };
  }

  /* -------------------------------------------------------
      LOGOUT
  -------------------------------------------------------- */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    await this.authService.revokeToken(req);

    return;
  }

  /* -------------------------------------------------------
      VALIDATE TOKEN
  -------------------------------------------------------- */
  @Post('token/validate')
  @UseGuards(JwtAuthGuard)
  async validateToken(@Req() req, @CurrentUser() user: Employee) {
    const payload: any = req.user;

    const valid = await this.authService.validateToken(user, payload.tokenId);

    return {
      // success: valid,
      message: valid ? 'Token is valid' : 'Token is invalid',
    };
  }
}
