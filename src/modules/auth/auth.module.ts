import { Module } from '@nestjs/common';
import { AuthController } from './controllers/Web/auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiAuthController } from './controllers/Api/api-auth.controller';
import { OauthAccessTokenModule } from '../oauth-access-token/oauth-access-token.module';
import { LoginController } from './controllers/Web/login.controller';
import { RegisterController } from './controllers/Web/register.controller';
import { EmployeeModule } from '../employee/employee.module';

@Module({
  controllers: [
    AuthController,
    ApiAuthController,
    LoginController,
    RegisterController,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  imports: [
    EmployeeModule,
    ConfigModule,
    UserModule,
    PassportModule,
    OauthAccessTokenModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('passport.secret', 'defaultSecret'),
        signOptions: {
          expiresIn: configService.get<string>(
            'passport.signOptions.expiresIn',
            '180d',
          ),
        },
      }),
    }),
  ],
})
export class AuthModule {}
