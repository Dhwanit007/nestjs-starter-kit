import { Injectable } from '@nestjs/common';
import { OAuthAccessToken } from './oauth-access-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccessTokenDto } from './dto/request/create-access-token.dto';

@Injectable()
export class OauthAccessTokenService {
  constructor(
    @InjectRepository(OAuthAccessToken)
    private readonly oauthAccessTokenRepository: Repository<OAuthAccessToken>,
  ) {}

  getUserToken(
    userId: number,
    tokenId: string,
  ): Promise<OAuthAccessToken | null> {
    return this.oauthAccessTokenRepository.findOne({
      where: { userId, revoked: false, tokenId },
    });
  }

  async createAccessToken(
    createAccessTokenDto: CreateAccessTokenDto,
  ): Promise<OAuthAccessToken> {
    const accessToken =
      this.oauthAccessTokenRepository.create(createAccessTokenDto);
    return this.oauthAccessTokenRepository.save(accessToken);
  }

  async revokeAccessToken(userId: number, tokenId: string): Promise<void> {
    const oauthAccessToken = await this.oauthAccessTokenRepository.findOne({
      where: { userId, tokenId },
    });
    if (!oauthAccessToken) {
      throw new Error('Access token not found');
    }
    oauthAccessToken.revoked = true;
    await this.oauthAccessTokenRepository.save(oauthAccessToken);
  }
}
