import { NestFactory } from '@nestjs/core';
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
  const app = await NestFactory.create(AppModule);
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);

  const config = appConfig(configService);

  await app.listen(config.appPort);
}
bootstrap();
