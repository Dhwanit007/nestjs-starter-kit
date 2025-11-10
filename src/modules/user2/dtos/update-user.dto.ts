import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  language: string;

  @IsDateString()
  @IsOptional()
  dob: Date;

  @IsString()
  @IsOptional()
  gender: 'male' | 'female';
}
