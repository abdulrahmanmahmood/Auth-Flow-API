import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'prisma/generated/prisma/client';
import { UsersModel } from 'prisma/generated/prisma/models';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaClient) {}
  getUserList(): Promise<UsersModel[]> {
    return this.prisma.users.findMany();
  }
}
