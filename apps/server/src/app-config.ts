import { DEFAULT_API_SERVER_PORT } from '@snippetly/common/lib';
import { config } from 'dotenv';
import path from 'node:path';
import { isDevelopment, isProduction } from './common/helpers/utils';
import { AppConfig } from './config/app-config.interface';
import { GoogleAuthenticationStrategy } from './config/auth/google-auth.strategy';
import { RedisCacheStrategy } from './config/system/cache/redis-cache.strategy';
import { NodemailerStrategy } from './config/system/email/nodemailer.strategy';
import { entitiesMap } from './entities/entities-map';

const envPaths = ['.env'];

if (isDevelopment()) {
    envPaths.push('.env.development');
}

if (isProduction()) {
    envPaths.push('.env.production');
}

config({
    path: envPaths.map(env => path.join(process.cwd(), env)),
});

const dbHost = process.env.DB_HOST;
const dbPort = Number(process.env.DB_PORT);
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbSchema = process.env.DB_SCHEMA ?? 'public';
const dbSSL = process.env.DB_SSL === 'true';
const dbChannelBinding = process.env.DB_CHANNEL_BINDING === 'true';

export const appConfig: AppConfig = {
    api: {
        host: process.env.HOST,
        port: isProduction()
            ? process.env.PORT
                ? Number(process.env.PORT)
                : undefined
            : DEFAULT_API_SERVER_PORT,
        ...(isProduction() ? { cors: {} } : { cors: { origin: true, credentials: true } }),
        trustProxy: isProduction() ? (process.env.VERCEL === '1' ? true : 1) : false,
    },
    auth: {
        requireVerification: false,
        developerAuthenticationStrategies: [
            new GoogleAuthenticationStrategy({ googleClientId: process.env.GOOGLE_CLIENT_ID! }),
        ],
    },
    database: {
        type: 'postgres',
        host: dbHost,
        ...(dbPort ? { port: dbPort } : {}),
        username: dbUser,
        password: dbPassword,
        database: dbName,
        schema: dbSchema,
        synchronize: isProduction() ? false : true,
        logging: false,
        ssl: dbSSL ? dbSSL : undefined,
        extra: {
            enableChannelBinding: dbChannelBinding,
            max: 3,
        },
        entities: Object.values(entitiesMap),
    },
    system: {
        shouldRunInitialization:
            process.env.RUN_STARTUP_INITIALIZATION === 'true' || process.env.VERCEL === '1' ? true : false,
        ...(isProduction()
            ? {
                  cacheStrategy: new RedisCacheStrategy({
                      ioredisOptions: { url: process.env.REDIS_URL },
                  }),
              }
            : {}),
        email: {
            emailTransporterStrategy: new NodemailerStrategy({
                email: process.env.GMAIL_APP_EMAIL!,
                password: process.env.GMAIL_APP_PASSWORD!,
            }),
            from: process.env.GMAIL_APP_EMAIL,
            accountVerificationCallbackUrl: process.env.ACCOUNT_VERIFICATION_CALLBACK_URL,
            passwordResetCallbackUrl: process.env.PASSWORD_RESET_CALLBACK_URL,
            identifierChangeCallbackUrl: process.env.IDENTIFIER_CHANGE_CALLBACK_URL,
        },
    },
};
