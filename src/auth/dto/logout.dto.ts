import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogOutDto {
  @IsString({ message: 'refresh token must be string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token to invalidate during logout',
    required: true,
  })
  token: string;
}
