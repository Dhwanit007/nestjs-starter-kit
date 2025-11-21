// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { TokenService } from '../token.service';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly tokenService: TokenService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: process.env.JWT_SECRET || 'thesecretkey@123',
//       passReqToCallback: true, // allows access to req in validate
//     });
//   }

//   async validate(req: any, payload: any) {
//     // console.log(payload)
//     const token = req.headers.authorization?.split(' ')[1]?.trim();

//     if (!token) throw new UnauthorizedException('Missing Token');

//     const isValid = await this.tokenService.validateToken(payload.sub, token);
//     if (!isValid) throw new UnauthorizedException('Invalid token');

//     return { userId: payload.sub, name: payload.username, role: payload.role };
//   }
// }

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          return req?.cookies?.['access_token']; // read from cookie
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET') || 'thesecretkey@123',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, name: payload.name, role: payload.role };
  }
}
