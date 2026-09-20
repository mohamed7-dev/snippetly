import { DEFAULT_API_SERVER_PORT } from '@snippetly/common/lib';
import { config } from 'dotenv';
import path from 'node:path';
import { isDevelopment, isProduction } from './common/helpers/utils';
import { AppConfig } from './config/app-config.interface';
import { GoogleAuthenticationStrategy } from './config/auth/google-auth.strategy';
import { NodemailerStrategy } from './config/system/email/nodemailer.strategy';

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

export const appConfig: AppConfig = {
    api: {
        host: process.env.HOST,
        port: isDevelopment() ? DEFAULT_API_SERVER_PORT : undefined,
        // ...(isProduction() && { cors: productionCorsOptions }),
    },
    auth: {
        requireVerification: false,
        developerAuthenticationStrategies: [
            new GoogleAuthenticationStrategy({ googleClientId: process.env.GOOGLE_CLIENT_ID! }),
        ],
    },
    database: {
        type: 'postgres',
        synchronize: true,
        logging: false,
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        schema: process.env.DB_SCHEMA,
    },
    system: {
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
