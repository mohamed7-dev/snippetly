import {
    DataSource,
    DataSourceOptions,
    EntityManager,
    EntitySchema,
    ObjectLiteral,
    ObjectType,
    Repository,
} from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { DB_TRANSACTION_MANAGER_KEY } from '../../common/constants/keys';
import { ConfigService } from '../../config/config.service';
import { Injectable } from '../ioc-container/injectable.decorator';

@Injectable()
export class DatabaseService {
    private static sharedDataSource?: DataSource;
    private static connectionPromise?: Promise<DataSource>;
    private _dataSource: DataSource;
    private _dataSourceOptions: DataSourceOptions;

    constructor(private readonly configService: ConfigService) {
        this._dataSourceOptions = this.configService.databaseOptions;
    }

    /**
     * @description
     * Exposes the underlying TypeORM DataSource.
     */
    get dataSource() {
        return this._dataSource;
    }

    public async connect(): Promise<DataSource> {
        if (DatabaseService.sharedDataSource?.isInitialized) {
            this._dataSource = DatabaseService.sharedDataSource;
            return this._dataSource;
        }

        if (!DatabaseService.connectionPromise) {
            const dataSource = new DataSource({
                ...this._dataSourceOptions,
            });

            DatabaseService.connectionPromise = dataSource
                .initialize()
                .then(initializedDataSource => {
                    DatabaseService.sharedDataSource = initializedDataSource;
                    return initializedDataSource;
                })
                .catch(error => {
                    DatabaseService.connectionPromise = undefined;
                    throw error;
                });
        }

        this._dataSource = await DatabaseService.connectionPromise;
        return this._dataSource;
    }

    public async disconnect() {
        const dataSource = DatabaseService.sharedDataSource ?? this._dataSource;
        if (!dataSource?.isInitialized) return;

        await dataSource.destroy();
        if (DatabaseService.sharedDataSource === dataSource) {
            DatabaseService.sharedDataSource = undefined;
        }
        DatabaseService.connectionPromise = undefined;
        this._dataSource = undefined as never;
    }

    /**
     * @description
     * Retrieves a TypeORM {@link Repository} for the given entity target.
     *
     * This method supports two usage patterns:
     *
     * 1. **With {@link RequestContext}**:
     *    - If a transaction-bound {@link EntityManager} exists on the context,
     *      the repository will be resolved from that manager.
     *    - Otherwise, it falls back to the default {@link DataSource}.
     *
     * 2. **Without {@link RequestContext}**:
     *    - The repository is resolved directly from the default {@link DataSource}.
     *
     * @remarks
     * - This abstraction ensures that all database operations automatically
     *   participate in an active transaction when available.
     * - It eliminates the need for callers to manually manage or pass around
     *   {@link EntityManager} instances.
     */
    getRepository<E extends ObjectLiteral>(target: ObjectType<E> | EntitySchema<E> | string): Repository<E>;
    getRepository<E extends ObjectLiteral>(
        ctx: RequestContext | undefined,
        target: ObjectType<E> | EntitySchema<E> | string,
    ): Repository<E>;
    public getRepository<E extends ObjectLiteral>(
        ctxOrTarget?: RequestContext | ObjectType<E> | EntitySchema<E> | string,
        maybeTarget?: ObjectType<E> | EntitySchema<E> | string,
    ): Repository<E> {
        if (ctxOrTarget instanceof RequestContext) {
            const manager = (ctxOrTarget as any)[DB_TRANSACTION_MANAGER_KEY] as EntityManager;
            if (manager) return manager.getRepository(maybeTarget!);
            return this.dataSource.getRepository(maybeTarget!);
        } else {
            return this.dataSource.getRepository(ctxOrTarget ?? maybeTarget!);
        }
    }
}
