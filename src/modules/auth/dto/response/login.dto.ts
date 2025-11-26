import { Expose, Type } from 'class-transformer';

import { UserAuthDto } from './user-auth.dto';

export class SerializeLogin {
  @Expose()
  @Type(() => UserAuthDto)
  user: UserAuthDto;

  @Expose()
  id: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  accessToken: string;
}
