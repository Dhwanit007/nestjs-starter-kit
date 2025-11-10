import { Expose } from 'class-transformer';
export class UserAuthDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  phoneNumber: string;
  @Expose()
  accessToken: string;
}
