import { PrismaClient } from './generated/prisma/client.js';

const prisma = new PrismaClient();

async function main() {
  // Use upsert to handle existing records
  await prisma.users.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'ahmed',
      email: 'john.doe@example.com',
      password: 'asdfasdfdsaafasdfdas',
    },
  });

  await prisma.users.upsert({
    where: { email: 'asdfasdf@esm.com' },
    update: {},
    create: {
      name: 'asdfasfsd',
      email: 'asdfasdf@esm.com',
      password: 'dfafdsfasdfasfd',
    },
  });

  console.log('Seed data created successfully!');
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
