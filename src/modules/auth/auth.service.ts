import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { scrypt as _scrypt, randomBytes, randomUUID } from 'crypto';
import { Request } from 'express';
import { promisify } from 'util';

import { CreateEmployeeDto } from '../employee/dto/create-employee.dto';
import { EmployeeService } from '../employee/employee.service';
import { Employee } from '../employee/entities/employee.entity';
import { OauthAccessTokenService } from '../oauth-access-token/oauth-access-token.service';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/request/register.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly empService: EmployeeService,
    private readonly jwtService: JwtService,
    private readonly oauthAccessTokenService: OauthAccessTokenService,
    private readonly configService: ConfigService,
  ) {}

  /* ----------------------- LOGIN ----------------------- */
  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  /* ----------------------- REGISTER ----------------------- */
  async register(body: CreateEmployeeDto) {
    // Check employee exists
    const existing = await this.empService.findByEmail(body.email);
    if (existing) {
      throw new BadRequestException('User already exists, please login');
    }

    // Hash password
    const salt = randomBytes(8).toString('hex');
    const hash = ((await scrypt(body.password, salt, 32)) as Buffer).toString(
      'hex',
    );
    body.password = `${salt}:${hash}`;

    // Create employee using EmployeeService
    const newUser = await this.empService.create(body);

    // Generate token
    // newUser.accessToken = await this.generateAccessToken(newUser);

    return newUser;
  }

  /* ----------------------- ACCESS TOKEN ----------------------- */
  async generateAccessToken(user: Employee) {
    const payload = {
      sub: user.id,
      tokenId: randomUUID(),
    };

    const accessToken = this.jwtService.sign(payload);

    const expiresInConfig = this.configService.get<string>(
      'passport.signOptions.expiresIn',
      '180d',
    );

    await this.oauthAccessTokenService.createAccessToken({
      userId: user.id,
      tokenId: payload.tokenId,
      expiresAt: new Date(Date.now() + this.parseExpiresIn(expiresInConfig)),
    });

    return accessToken;
  }

  /* ----------------------- LOGOUT ----------------------- */
  async revokeToken(req: Request) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) throw new Error('No access token provided');

    const decoded = this.jwtService.decode(token) as any;

    if (!decoded || !decoded.tokenId) {
      throw new Error('Invalid token');
    }

    return this.oauthAccessTokenService.revokeAccessToken(
      decoded.sub,
      decoded.tokenId,
    );
  }

  /* ----------------------- TOKEN VALIDATION ----------------------- */
  async validateToken(user: Employee, tokenId: string): Promise<boolean> {
    const token = await this.oauthAccessTokenService.getUserToken(
      user.id,
      tokenId,
    );

    if (!token) return false;

    return !(token.revoked || token.expiresAt < new Date());
  }

  /* ----------------------- USER VALIDATION (LOGIN) ----------------------- */
  async validateUser(email: string, password: string) {
    const user = await this.empService.findByEmail(email);
    if (!user) return null;

    const [salt, storedHash] = user.password.split(':'); // FIXED

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) return null;

    return user;
  }

  /* ----------------------- EXPIRES-IN PARSER ----------------------- */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 180 * 24 * 60 * 60 * 1000;

    const value = parseInt(match[1], 10);

    switch (match[2]) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 180 * 24 * 60 * 60 * 1000;
    }
  }
}
