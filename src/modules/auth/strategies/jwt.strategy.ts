import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EmployeeService } from 'src/modules/employee/employee.service';

import { UserService } from '../../user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private authService: AuthService,
    private employeeService: EmployeeService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'passport.secret',
        'defaultSecret',
      ),
    });
  }

  async validate(payload: { sub: string; tokenId: string }) {
    const user = await this.employeeService.getById(payload.sub);
    if (user) {
      const isValidToken = await this.authService.validateToken(
        user,
        payload.tokenId,
      );
      if (isValidToken) {
        return user;
      }
    }
    return null;
  }
}
