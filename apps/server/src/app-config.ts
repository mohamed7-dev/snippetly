import { DEFAULT_API_SERVER_PORT } from '@snippetly/common/lib';
import { config } from 'dotenv';
import path from 'node:path';
import { AppConfig } from './config/app-config.interface';
import { UploadthingStrategy } from './config/system/binary-storage/uploadthing.strategy';
import { NodemailerStrategy } from './config/system/email/nodemailer.strategy';

config({
    path: ['.env', '.env.development', '.env.production'].map(env => path.join(process.cwd(), env)),
});

export const appConfig: AppConfig = {
    api: {
        host: 'localhost',
        port: DEFAULT_API_SERVER_PORT,
        // ...(isProduction() && { cors: productionCorsOptions }),
    },
    auth: {
        requireVerification: false,
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
        emailTransporterStrategy: new NodemailerStrategy({
            email: process.env.GMAIL_APP_EMAIL!,
            password: process.env.GMAIL_APP_PASSWORD!,
        }),
        binaryStorageStrategy: new UploadthingStrategy({ token: process.env.UPLOADTHING_TOKEN as string }),
    },
};
