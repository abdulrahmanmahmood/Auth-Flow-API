import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiPrefix = 'api';
  app.setGlobalPrefix(apiPrefix); // should be above the listening or will not work

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
