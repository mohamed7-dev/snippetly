import path from 'node:path';
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
import { entitiesMap } from '../../entities/entities-map';
import { Injectable } from '../ioc-container/injectable.decorator';

@Injectable()
export class DatabaseService {
    private _dataSource: DataSource;
    private _dataSourceOptions: DataSourceOptions;
    defaultEntities = [path.join(__dirname, '..', '..', '**', '*.entity.{ts,js}')];
    defaultMigrations = [path.join(__dirname, '..', '..', '**', '*migration*.{ts,js}')];

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

    public async connect() {
        this._dataSource = new DataSource({
            ...this._dataSourceOptions,
            entities: Object.values(entitiesMap),
            migrations: this._dataSourceOptions.migrations?.length
                ? this._dataSourceOptions.migrations
                : this.defaultMigrations,
        });
        return await this._dataSource.initialize();
    }

    public async disconnect() {
        await this._dataSource.destroy();
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
