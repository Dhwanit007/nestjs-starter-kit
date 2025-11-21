import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  assignedEmployeeIds?: string[];
}
