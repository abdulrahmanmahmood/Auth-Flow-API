import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { LoginDto } from './dto/login-dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogOutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth/jwt-auth.guard';
import type { Request as RequestType } from 'express';
import type { Prisma } from '@prisma/client';

type UserWithRelations = Prisma.UsersGetPayload<{
  include: {
    verificationToken: true;
    oathAccounts: true;
    todos: true;
  };
}>;
interface RequestWithUser extends RequestType {
  user: Omit<UserWithRelations, 'password'>;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() registerDto: RegisterDTO) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  verify(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyToken(verifyEmailDto);
  }

  @Post('resend-verification-email')
  resendVerificationEmail(
    @Body() resendVerificationDto: ResendVerificationDto,
  ) {
    return this.authService.resendVerifyToken(resendVerificationDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  logout(@Body() logoutDto: LogOutDto) {
    return this.authService.logout(logoutDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgetPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('profile')
  // JWTAuthGuard is a guard that checks if the user is authenticated
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: RequestWithUser) {
    return this.authService.getCurrentUser(req.user.id);
  }
}
