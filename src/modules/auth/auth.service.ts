import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { randomBytes, scrypt as _scrypt, randomUUID } from 'crypto';
import { promisify } from 'util';
import { RegisterDto } from './dto/request/register.dto';
import { User } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import { OauthAccessTokenService } from '../oauth-access-token/oauth-access-token.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

const scrypt = promisify(_scrypt);
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private oauthAccessTokenService: OauthAccessTokenService,
    private configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user: Promise<User | null> = this.validateUser(email, password);
    if (user === null) throw new UnauthorizedException();
    return user;
  }

  async register(body: RegisterDto) {
    const user = await this.userService.findOneByEmail(body.email);

    if (user)
      throw new BadRequestException('User already exists, please login');

    const salt = randomBytes(8).toString('hex');
    const hash = ((await scrypt(body.password, salt, 32)) as Buffer).toString(
      'hex',
    );
    body.password = `${salt}.${hash}`;

    const newUser = await this.userService.create(body);
    newUser.accessToken = await this.generateAccessToken(newUser);
    return newUser;
  }

  async generateAccessToken(user: User) {
    const payload = {
      sub: user.id,
      tokenId: randomUUID(),
    };
    const accessToken = this.jwtService.sign(payload);
    const expiresInConfig = this.configService.get<string>(
      'passport.signOptions.expiresIn',
      '180d',
    );
    const expiresInStr = expiresInConfig ?? '180d';
    await this.oauthAccessTokenService.createAccessToken({
      userId: user.id,
      tokenId: payload.tokenId,
      expiresAt: new Date(Date.now() + this.parseExpiresIn(expiresInStr)),
    });
    return accessToken;
  }
  revokeToken(req: Request) {
    console.log(
      this.configService.get<string>('passport.secret', 'defaultSecret'),
    );
    // Extract token string from Authorization header
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      throw new Error('No access token found in request');
    }

    const validateJwtPayload = (payload: unknown) => {
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'tokenId' in payload &&
        typeof payload['tokenId'] === 'string' &&
        'sub' in payload &&
        typeof payload['sub'] === 'number'
      ) {
        return {
          sub: payload['sub'],
          tokenId: payload['tokenId'],
          iat: payload['iat'] as number | undefined,
          exp: payload['exp'] as number | undefined,
        };
      }
      throw new Error('Invalid JWT payload');
    };

    const decodeJwt = (token: string): Record<string, unknown> => {
      const decoded = this.jwtService.decode(token);

      if (!decoded || typeof decoded !== 'object') {
        throw new Error('Failed to decode JWT');
      }

      return decoded as Record<string, unknown>;
    };

    const payload = decodeJwt(token);
    const jwtPayload = validateJwtPayload(payload);

    if (!req.user || typeof req.user.id !== 'number') {
      throw new Error('Invalid user information in request');
    }
    return this.oauthAccessTokenService.revokeAccessToken(
      req.user.id,
      jwtPayload.tokenId,
    );
  }
  async validateToken(user: User, tokenId: string): Promise<boolean> {
    const token = await this.oauthAccessTokenService.getUserToken(
      user.id,
      tokenId,
    );
    if (token) {
      if (!(token.revoked || token.expiresAt < new Date())) return true;
    }
    return false;
  }

  public async validateUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) return null;
    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (hash.toString('hex') !== storedHash) return null;
    return user;
  }

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
