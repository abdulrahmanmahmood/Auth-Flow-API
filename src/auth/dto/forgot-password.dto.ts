import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @IsString({ message: 'Invalid Email Address' })
  @IsEmail()
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address to send password reset instructions',
    required: true,
  })
  email: string;
}
