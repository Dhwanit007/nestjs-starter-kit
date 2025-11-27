import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

import { Status } from '../entities/projects.entity';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedEmployeeIds?: string[];

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
