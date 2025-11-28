import { Expose } from 'class-transformer';

export class ProjectListDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  assignedEmployeeIds: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  deadline: Date;

  @Expose()
  status: string;
}
