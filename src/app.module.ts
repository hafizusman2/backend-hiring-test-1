import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { NodeEnv } from './enums/node-env.enum';
import { CallModule } from './call/call.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config = appConfig(configService);
        return {
          ...config.database,
          autoLoadEntities: true,
          synchronize: config.environment === NodeEnv.DEVELOPMENT,
        };
      },
      inject: [ConfigService],
    }),
    CallModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
