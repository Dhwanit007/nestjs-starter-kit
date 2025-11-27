import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  // Make assignedEmployeeIds optional for create; if not provided it will be null/undefined
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    value === undefined || value === null
      ? undefined
      : Array.isArray(value)
        ? value
        : [value],
  )
  assignedEmployeeIds?: string[];
}
