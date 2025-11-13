import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
export class CreateUserDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  @ApiProperty({
    example: 'sdfas@example.com',
    description: 'this is email',
    required: true,
  })
  email: string;

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
    example: 'MySecure123!',
    description:
      'User password - must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    minLength: 6,
    required: true,
  })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @ApiProperty({
    example: 'John',
    description: 'User first name',
    minLength: 2,
    required: false,
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    minLength: 2,
    required: false,
  })
  lastName: string;
}
