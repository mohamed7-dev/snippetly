import path from 'node:path';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class DatabaseInitializer {
    private client: import('pg').Client;

    public async init(testFilename: string, connectionOptions: PostgresConnectionOptions) {
        const dbName = this.getDbName(testFilename);
        (connectionOptions as any).database = dbName;
        (connectionOptions as any).synchronize = true;
        this.client = await this.getPostgresConnection(connectionOptions);
        await this.client.query(`DROP DATABASE IF EXISTS ${dbName}`);
        await this.client.query(`CREATE DATABASE ${dbName}`);
        return connectionOptions;
    }

    public destroy(): void | Promise<void> {
        return this.client.end();
    }

    public async populate(populateFn: () => Promise<void>): Promise<void> {
        await populateFn();
    }

    private async getPostgresConnection(
        connectionOptions: PostgresConnectionOptions,
    ): Promise<import('pg').Client> {
        const { Client } = require('pg');
        const client = new Client({
            host: connectionOptions.host,
            port: connectionOptions.port,
            user: connectionOptions.username,
            password: connectionOptions.password,
            database: 'postgres',
        });
        await client.connect();
        return client;
    }

    private getDbName(filename: string): string {
        return 'e2e_' + path.basename(filename).replace(/[^a-z0-9_]/gi, '_');
    }
}
