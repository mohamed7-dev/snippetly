import { config } from 'dotenv';
import path from 'node:path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { isDevelopment, isProduction } from '../src/common/helpers/utils';
import { entitiesMap } from '../src/entities/entities-map';

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
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbSchema = process.env.DB_SCHEMA ?? 'public';
const dbSSL = process.env.DB_SSL === 'true';
const dbChannelBinding = process.env.DB_CHANNEL_BINDING === 'true';

export const migrationDataSource = new DataSource({
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
    migrations: [path.join(__dirname, '..', 'migrations/*.{ts,js}')],
});
