import { Expose } from 'class-transformer';

export class UserDetailDto {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  phoneNumber: string;
}
