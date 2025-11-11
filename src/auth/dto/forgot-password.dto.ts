import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsString({ message: 'Invalid Email Address' })
  @IsEmail()
  email: string;
}
