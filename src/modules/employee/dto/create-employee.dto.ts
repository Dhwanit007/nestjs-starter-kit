import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

import { Role } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;
  @IsEnum(Role, { message: 'Invalid role selected' })
  @IsOptional()
  role: Role;
}
