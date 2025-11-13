import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
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

  //setup template engine
  app.setBaseViewsDir('src/views');
  app.setViewEngine('hbs');

  // Enable Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Api Doc
  const config = new DocumentBuilder()
    .setTitle('Auth flow')
    .setDescription('Authentication flow with all features')
    .setVersion('1.0')
    .addTag('Auth')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'jwt',
        name: 'jwt',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'token',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, documentFactory);

  await app.listen(process.env.PORT ?? 5001, '0.0.0.0');
}
bootstrap();
