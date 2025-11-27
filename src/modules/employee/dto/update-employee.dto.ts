import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  departmentId?: string | null;
}
