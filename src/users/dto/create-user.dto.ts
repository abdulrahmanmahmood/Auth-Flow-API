import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
export class CreateUserDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 5 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,}$/,
    {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
    },
  )
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;
}
