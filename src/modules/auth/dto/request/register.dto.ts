import {
  IsEmail,
  IsStrongPassword,
  IsPhoneNumber,
  IsString,
  IsNotEmpty,
} from 'class-validator';
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
