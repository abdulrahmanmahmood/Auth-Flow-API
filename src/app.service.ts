import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'prisma/generated/prisma/client';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaClient) {}
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
