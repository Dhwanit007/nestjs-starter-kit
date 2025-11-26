import { Expose } from 'class-transformer';

export class AssignedEmployeeDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}
