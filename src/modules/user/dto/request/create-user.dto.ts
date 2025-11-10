import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
