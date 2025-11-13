import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address to verify',
    required: true,
  })
  email: string;

  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  @ApiProperty({
    example: '1234',
    description: 'Verification token (4-digit code)',
    required: true,
    minLength: 4,
    maxLength: 4,
  })
  token: string;
}
