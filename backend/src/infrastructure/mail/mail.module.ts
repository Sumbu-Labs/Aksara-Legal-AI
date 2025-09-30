import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';

const applyMailerVerifyTransporterPatch = (() => {
  let applied = false;

  return () => {
    if (applied) {
      return;
    }

    const mailerPrototype = MailerService.prototype as unknown as Record<
      string,
      unknown
    >;
    const verifyTransporter = mailerPrototype?.verifyTransporter as
      | ((transporter: unknown, name?: string) => void)
      | undefined;

    if (!verifyTransporter) {
      applied = true;
      return;
    }

    const implementationSource = verifyTransporter.toString();
    if (implementationSource.includes('Promise.resolve')) {
      applied = true;
      return;
    }

    mailerPrototype.verifyTransporter = function patchedVerifyTransporter(
      transporter: { verify?: () => unknown },
      name?: string,
    ) {
      const transporterName = name ? ` '${name}'` : '';
      const logger = (
        this as {
          mailerLogger?: {
            debug?: (message: string) => void;
            error?: (message: string) => void;
          };
        }
      ).mailerLogger;

      if (!transporter || typeof transporter.verify !== 'function') {
        return;
      }

      let verificationResult: unknown;

      try {
        verificationResult = transporter.verify();
      } catch (error) {
        if (logger && typeof logger.error === 'function') {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          logger.error(
            `Error occurred while verifying the transporter${transporterName}: ${errorMessage}`,
          );
        }
        return;
      }

      Promise.resolve(verificationResult)
        .then(() => {
          if (logger && typeof logger.debug === 'function') {
            logger.debug(`Transporter${transporterName} is ready`);
          }
        })
        .catch((error) => {
          if (logger && typeof logger.error === 'function') {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            logger.error(
              `Error occurred while verifying the transporter${transporterName}: ${errorMessage}`,
            );
          }
        });
    };

    applied = true;
  };
})();

applyMailerVerifyTransporterPatch();

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const transportHost = config.get<string>('SMTP_HOST');
        const transportPort = Number(config.get<string>('SMTP_PORT') ?? 587);
        const secure =
          (config.get<string>('SMTP_SECURE') ?? 'false').toLowerCase() ===
          'true';
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
            from:
              config.get<string>('NOTIFICATION_EMAIL_FROM') ??
              'no-reply@localhost',
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
