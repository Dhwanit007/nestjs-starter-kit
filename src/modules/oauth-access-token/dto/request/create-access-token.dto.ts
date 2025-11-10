import { IsDate, IsNumber, IsUUID, MinDate } from 'class-validator';

export class CreateAccessTokenDto {
  @IsNumber()
  userId: number;

  @IsUUID()
  tokenId: string;

  @IsDate()
  @MinDate(new Date())
  expiresAt: Date;
}
