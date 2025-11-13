import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const apiPrefix = 'api';
  app.setGlobalPrefix(apiPrefix); // should be above the listening or will not work
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setBaseViewsDir('src/views');

  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 5001, '0.0.0.0');
}
bootstrap();
