import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Users } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async findByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: {
        email: email,
      },
    });
  }
  async create(createUserDto: CreateUserDto): Promise<Users> {
    return this.prisma.users.create({
      data: createUserDto,
    });
  }
  async markEmailAsVerified(email: string) {
    return this.prisma.users.update({
      where: {
        email: email,
      },
      data: {
        isEmailVerified: true,
      },
    });
  }
  async updatePassword(userId: string, password: string) {
    return this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        password: password,
      },
    });
  }

  async findById(userId: string) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isEmailVerified: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
  }
}
