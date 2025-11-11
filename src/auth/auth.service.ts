import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger();
  constructor(
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}
  async register(registerDto: RegisterDTO) {
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
}
