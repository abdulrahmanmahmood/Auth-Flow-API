import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  getUserList() {
    return this.prisma.users.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isEmailVerified: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        todos: {
          select: {
            id: true,
            userId: true,
            title: true,
            completed: true,
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }
}
