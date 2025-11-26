import { Expose } from 'class-transformer';

export class EmployeeSerialize {
  @Expose()
  id: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  role: string;
}
