import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ABC123',
    description: 'Password reset token (6-character code)',
    required: true,
    minLength: 6,
    maxLength: 6,
  })
  token: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 5 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#]{7,}$/,
    {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
    },
  )
  @ApiProperty({
    example: 'MyNewSecure123!',
    description:
      'New password - must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    minLength: 6,
    required: true,
  })
  password: string;
}
