import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address to resend verification token',
    required: true,
  })
  email: string;
}
