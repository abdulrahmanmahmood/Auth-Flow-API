import { IsNotEmpty, IsString } from 'class-validator';

export class LogOutDto {
  @IsString({ message: 'refresh token must be string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  token: string;
}
