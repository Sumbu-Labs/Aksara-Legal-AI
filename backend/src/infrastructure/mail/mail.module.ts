import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const transportHost = config.get<string>('SMTP_HOST');
        const transportPort = Number(config.get<string>('SMTP_PORT') ?? 587);
        const secure = (config.get<string>('SMTP_SECURE') ?? 'false').toLowerCase() === 'true';
        const user = config.get<string>('SMTP_USER');
        const pass = config.get<string>('SMTP_PASS');

        const canSend = Boolean(transportHost && user && pass);

        return {
          transport: canSend
            ? {
                host: transportHost,
                port: transportPort,
                secure,
                auth: {
                  user,
                  pass,
                },
              }
            : {
                jsonTransport: true,
              },
          defaults: {
            from: config.get<string>('NOTIFICATION_EMAIL_FROM') ?? 'no-reply@localhost',
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
