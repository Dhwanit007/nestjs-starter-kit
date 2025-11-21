import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber: string;

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
