import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsStrongPassword,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  
  @IsEmail()
  email: string;
  
  @IsPhoneNumber()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsStrongPassword()
  password: string;
}
