import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { LoginDto } from './dto/login-dto';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogOutDto } from './dto/logout.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Users } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger();
  constructor(
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}
  async register(registerDto: RegisterDTO): Promise<Omit<Users, 'password'>> {
    try {
      const existingUser = await this.userService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new BadRequestException('User Already Exist');
      }

      // * Hash the password
      const hashedPassword = await this.hashPassword(registerDto.password);
      const user = await this.userService.create({
        ...registerDto,
        password: hashedPassword,
      });

      const verificationToken = await this.createVerificationToken(user.id);

      // Send an email with the verification code
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationToken.token,
        user.firstName || undefined,
      );

      const { password, ...userWithoutPassword } = user;
      // return userWithoutPassword;
      return user;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async verifyToken(verifyEmailDto: VerifyEmailDto) {
    try {
      const verificationToken = await this.prisma.verificationToken.findUnique({
        where: {
          token: verifyEmailDto.token,
        },
      });
      if (!verificationToken) {
        throw new BadRequestException({
          message: 'Invalid verification token',
          desertion: 'Verification  token is invalid or expired',
        });
      }
      if (new Date() > verificationToken.expires) {
        await this.prisma.verificationToken.delete({
          where: {
            id: verificationToken.id,
          },
        });
        throw new BadRequestException({
          message: 'Verification token expired',
          description: 'Verification token is expired',
        });
      }
      await this.userService.markEmailAsVerified(verifyEmailDto.email);
      await this.prisma.verificationToken.delete({
        where: {
          token: verificationToken.token,
        },
      });

      return {
        message: 'Email verified successfully',
        description:
          'Email verification completed successfully, You can now login',
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async resendVerifyToken(resendVerificationDto: ResendVerificationDto) {
    const { email } = resendVerificationDto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException({
        message: 'User not found',
        description: 'User with this email does not exist',
      });
    }

    if (user.isEmailVerified) {
      return {
        message: 'Email is already verified',
      };
    }

    const verificationToken = await this.createVerificationToken(user.id);
    await this.mailService.sendVerificationEmail(
      email,
      verificationToken.token,
      user.firstName as string,
    );

    return {
      message: 'Verification email sent successfully ',
      description: 'Verification email sent successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Wrong Email or Password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email must be verified');
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Wrong Email or Password');
    }

    const accessToken = this.generateAccessToken(user.id, email);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      message: 'User logged in successfully',
      refreshToken,
      accessToken,
    };
  }

  async logout(logoutDto: LogOutDto) {
    const { token } = logoutDto;
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: {
        token: token,
      },
    });
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: refreshToken?.userId,
      },
    });

    return {
      message: 'User Logged Out Successfully',
    };
  }

  async forgetPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const { email } = forgotPasswordDto;

      const user = await this.userService.findByEmail(email);
      if (!user) {
        return {
          message: 'Password reset instructions sent',
          descriptions:
            'If your email is registered, you will receive password reset instructions',
        };
      }
      await this.prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // Generate a random 6-chars token and save in the DB
      const resetToken = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const expires = new Date();
      expires.setDate(expires.getMinutes() + 15);

      await this.prisma.passwordResetToken.create({
        data: {
          expires,
          token: resetToken,
          userId: user.id,
        },
      });
      // Sent Reset Email
      await this.mailService.sendResetPasswordEmail(
        email,
        resetToken,
        user.firstName as string,
      );
      return {
        message: 'Password reset instructions sent',
        descriptions:
          'If your email is registered, you will receive password reset instructions',
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { password, token } = resetPasswordDto;

      const passwordResetToken =
        await this.prisma.passwordResetToken.findUnique({
          where: {
            token: token,
          },
        });

      if (!passwordResetToken) {
        throw new BadRequestException({
          message: 'Invalid reset token',
          description: 'The password reset token is invalid or has expired',
        });
      }
      if (new Date() > passwordResetToken.expires) {
        await this.prisma.passwordResetToken.delete({
          where: {
            id: passwordResetToken.id,
          },
        });

        throw new BadRequestException({
          message: 'Token expired',
          description:
            'The password reset token has expired. Please request a new one.',
        });
      }

      // Reset Password Process
      const hashedPassword = await this.hashPassword(password);

      // update the User's password
      await this.userService.updatePassword(
        passwordResetToken.userId,
        hashedPassword,
      );
      // Delete password reset tokens for this user
      await this.prisma.passwordResetToken.delete({
        where: {
          token: passwordResetToken.token,
        },
      });
      // Delete all refresh tokens for this user to force re-login with the new password
      await this.prisma.refreshToken.deleteMany({
        where: {
          userId: passwordResetToken.userId,
        },
      });

      return {
        message: 'Password reset successful',
        description:
          'Your password has been reset successfully. You can now login with your new password.',
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { token } = refreshTokenDto;
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: {
        token,
      },
    });
    if (!refreshToken) {
      throw new BadRequestException('Invalid refresh token');
    }
    if (new Date() > refreshToken.expires) {
      await this.prisma.refreshToken.delete({
        where: {
          id: refreshToken.id,
        },
      });
      throw new BadRequestException('Refresh token expired');
    }

    const user = await this.prisma.users.findUnique({
      where: {
        id: refreshToken.userId,
      },
    });
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user.id, user.email);

    const newRefreshToken = this.generateRefreshToken(refreshToken.userId);
    return {
      newRefreshToken,
    };
  }

  async getCurrentUser(userId: string) {
    return await this.userService.findById(userId);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  private async createVerificationToken(userId: string) {
    // if You want to delete all the  previous verificationToken
    // await this.prisma.verificationToken.deleteMany({
    //   where: {
    //     userId: userId,
    //   },
    // });

    // Generate a 4-digit verification code

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const tokenExpireMinutes = this.configService.get<string>(
      'VERIFICATION_TOKEN_EXPIRY_MINUTES',
    );
    const NumericTokenExpireMinutes = parseInt(
      tokenExpireMinutes as string,
      10,
    );
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + NumericTokenExpireMinutes);

    return this.prisma.verificationToken.create({
      data: {
        token: verificationCode,
        expires,
        userId,
      },
    });
  }

  private generateAccessToken(userId: string, email: string) {
    const payload = { sub: userId, email };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });
  }

  private async generateRefreshToken(userId: string) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        expires: { lt: oneWeekAgo },
      },
    });

    const jwtToken = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      },
    );
    await this.prisma.refreshToken.create({
      data: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        token: jwtToken,
        userId: userId,
      },
    });
    return jwtToken;
  }
}
