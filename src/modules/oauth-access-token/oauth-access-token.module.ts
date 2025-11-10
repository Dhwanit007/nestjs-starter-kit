import { Module } from '@nestjs/common';
import { OauthAccessTokenService } from './oauth-access-token.service';
import { OAuthAccessToken } from './oauth-access-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [OauthAccessTokenService],
  exports: [OauthAccessTokenService],
  imports: [TypeOrmModule.forFeature([OAuthAccessToken])],
})
export class OauthAccessTokenModule {}
