import { Expose, Type } from 'class-transformer';

import { AssignedEmployeeDto } from '../../../../modules/employee/dto/res/assigned-employee.dto';

export class DepartmentListDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => AssignedEmployeeDto)
  assignedEmployees: AssignedEmployeeDto[];
}
