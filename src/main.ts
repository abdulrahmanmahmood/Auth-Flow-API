import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  // Api Doc
  const config = new DocumentBuilder()
    .setTitle('Auth flow')
    .setDescription('Authentication flow with all features')
    .setVersion('1.0')
    .addTag('Auth')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 5001, '0.0.0.0');
}
bootstrap();
