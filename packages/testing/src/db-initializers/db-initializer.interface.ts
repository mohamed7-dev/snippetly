import { BaseDataSourceOptions } from 'typeorm/data-source/BaseDataSourceOptions.js';

/**
 * @description
 * This interface defines the shape of the database service used to initialize data
 * in a test suite.
 */
export interface DBInitializer<DataSourceOptions extends BaseDataSourceOptions> {
    /**
     * @description
     * uses `testFileName` to derive database name from, creates the database
     * and modifies the `dataSourceOptions` to point to that database
     */
    init(testFileName: string, dataSourceOptions: DataSourceOptions): Promise<DataSourceOptions>;

    /**
     * @description
     * should be clearing up anything initialized when `init` method was called
     */
    destroy(): void | Promise<void>;

    /**
     * @description
     * Executes the `populateFn` to seed initial data into the database
     */
    populate(populateFn: () => Promise<void>): Promise<void>;
}
