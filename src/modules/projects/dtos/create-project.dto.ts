import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;
  @IsString()
  description: string;

  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  assignedEmployeeIds: string[];
}
