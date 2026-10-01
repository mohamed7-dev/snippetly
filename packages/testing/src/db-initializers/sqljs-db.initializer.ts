import fs from 'node:fs';
import path from 'node:path';
import { SqljsConnectionOptions } from 'typeorm/driver/sqljs/SqljsConnectionOptions.js';
import { DBInitializer } from './db-initializer.interface';

type Mutable<T> = { -readonly [Key in keyof T]: T[Key] };

export class SqljsDBInitializer implements DBInitializer<SqljsConnectionOptions> {
    private dbFilePath: string;
    private dataSourceOptions: SqljsConnectionOptions;

    constructor(private dataDir: string) {}
    async init(
        testFileName: string,
        dataSourceOptions: SqljsConnectionOptions,
    ): Promise<SqljsConnectionOptions> {
        this.dbFilePath = this.resolveFilePath(testFileName);
        this.dataSourceOptions = dataSourceOptions;

        (dataSourceOptions as Mutable<SqljsConnectionOptions>).location = this.dbFilePath;
        return await Promise.resolve(dataSourceOptions);
    }

    destroy(): void | Promise<void> {
        return undefined;
    }

    async populate(populateFn: () => Promise<void>): Promise<void> {
        if (!fs.existsSync(this.dbFilePath)) {
            const dirName = path.dirname(this.dbFilePath);
            fs.mkdirSync(dirName, { recursive: true });
            (this.dataSourceOptions as Mutable<SqljsConnectionOptions>).autoSave = true;
            (this.dataSourceOptions as Mutable<SqljsConnectionOptions>).synchronize = true;
            await populateFn();
            (this.dataSourceOptions as Mutable<SqljsConnectionOptions>).autoSave = false;
            (this.dataSourceOptions as Mutable<SqljsConnectionOptions>).synchronize = false;
        }
    }

    private resolveFilePath(testFileName: string) {
        const dbFileName = path.basename(testFileName) + '.sqlite';
        const dbFilePath = path.join(this.dataDir, dbFileName);
        return dbFilePath;
    }
}
