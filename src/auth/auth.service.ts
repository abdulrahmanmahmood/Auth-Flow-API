import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

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
