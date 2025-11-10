import { PrismaClient } from './generated/prisma/client.js';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Use upsert to handle existing records
  const users = await Promise.all(
    Array.from({ length: 25 }, async (_, index) => {
      return await prisma.users.upsert({
        where: { email: `user${index}@example.com` },
        update: {},
        create: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(), // Fixed: was using firstName
          email: `user${index}@example.com`,
          password: faker.internet.password(),
          isEmailVerified: faker.datatype.boolean(),
          provider: faker.helpers.arrayElement([
            'EMAIL_PASSWORD',
            'GOOGLE',
            'GITHUB',
          ]),
        },
      });
    }),
  );

  const userIds = users.map((user) => user.id);

  await prisma.todo.createMany({
    data: Array.from({ length: 100 }, () => ({
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      completed: faker.datatype.boolean(), // Fixed: was isCompleted
      priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
      userId: faker.helpers.arrayElement(userIds), // Fixed: was arrayElements (returns array)
    })),
    skipDuplicates: true,
  });

  console.log(`Created ${users.length} users and 100 todos`);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
