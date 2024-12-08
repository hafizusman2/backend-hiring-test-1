import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { ConfigService } from '@nestjs/config';

const swaggerConfig = new DocumentBuilder()
  .setTitle('TuringTech Backend Test')
  .setDescription('API Documentation')
  .setVersion('1.0')
  .build();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Set the directory for static assets
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Set the directory for view templates
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Set EJS as the templating engine
  app.setViewEngine('ejs');

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);

  const config = appConfig(configService);

  await app.listen(config.appPort);
}
bootstrap();
