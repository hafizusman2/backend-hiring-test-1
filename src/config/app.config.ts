import { ConfigService } from '@nestjs/config';
import { NodeEnv } from 'src/enums/node-env.enum';

export const appConfig = (configService: ConfigService) => ({
  database: {
    type: 'postgres' as const,
    host: configService.get<string>('DATABASE_HOST') || 'localhost',
    port: configService.get<number>('DATABASE_PORT') || 5432,
    username: configService.get<string>('DATABASE_USERNAME') || 'root',
    password: configService.get<string>('DATABASE_PASSWORD') || 'secret',
    database: configService.get<string>('DATABASE_NAME') || 'turing-task-ivr',
  },
  twilio: {
    accountSId: configService.get<string>('TWILIO_ACCOUNT_SID') || '',
    authToken: configService.get<string>('TWILIO_AUTH_TOKEN') || '',
    fromTwilioPhone: configService.get<string>('TWILIO_PHONE_NUMBER') || '',
    forwardToPhone: configService.get<string>('FORWARD_TO_NUMBER') || '',
  },
  appPort: configService.get<number>('APP_PORT') || 5001,
  environment: configService.get<NodeEnv>('NODE_ENV') || NodeEnv.DEVELOPMENT,
});
