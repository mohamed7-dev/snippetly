import { from, lastValueFrom, Observable, retryWhen, take, tap } from 'rxjs';
import { DataSource, QueryRunner, TransactionAlreadyStartedError } from 'typeorm';
import { TransactionIsolationLevel, TransactionMode } from '../../api/middlewares/transaction.interceptor';
import { RequestContext } from '../../api/request-context/request-context';
import { DB_TRANSACTION_MANAGER_KEY } from '../../common/constants/keys';
import { Injectable } from '../ioc-container/injectable.decorator';

/**
 * @description
 * Provides helper utilities for working with the ORM layer. primarily focused on
 * transaction management and retry strategies.
 *
 * This service abstracts the complexity of:
 * - Managing {@link QueryRunner} lifecycle
 * - Supporting nested transactions
 * - Retrying operations on transient database errors (e.g., deadlocks)
 * - Bridging Promise and Observable-based workflows
 *
 * @remarks
 * - The transaction manager is attached to the {@link RequestContext} to ensure
 *   consistency across the request lifecycle.
 * - Supports both manual and automatic transaction handling via `transactionMode`.
 * - Designed to be resilient in high-concurrency environments.
 */
@Injectable()
export class TransactionManagerService {
    /**
     * @description
     * Executes a given callback within a transactional context.
     *
     * This method:
     * - Reuses an existing transaction if present (supports nesting)
     * - Creates a new {@link QueryRunner} if needed
     * - Optionally starts a transaction (`transactionMode: 'auto'`)
     * - Retries the operation on retriable errors (e.g., deadlocks)
     * - Commits or rolls back the transaction appropriately
     * - Ensures proper cleanup of the query runner
     */
    public async runInTransaction<T>(
        requestContext: RequestContext,
        callback: (requestContext: RequestContext) => Promise<T> | Observable<T>,
        dataSource: DataSource,
        options?: {
            isolationLevel?: TransactionIsolationLevel;
            transactionMode?: TransactionMode;
        },
    ): Promise<T> {
        const queryRunner = this.getOrCreateQueryRunner(requestContext, dataSource);

        if (options?.transactionMode === 'auto') {
            await this.startTransaction(queryRunner, options.isolationLevel);
        }

        try {
            const result = await this.executeWithRetry(callback, requestContext);

            if (queryRunner.isTransactionActive) {
                await queryRunner.commitTransaction();
            }

            return result;
        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        } finally {
            await this.releaseQueryRunnerIfNeeded(queryRunner);
        }
    }

    /**
     * @description
     * Retrieves an existing {@link QueryRunner} from the request context,
     * or creates a new one if none exists or if it has been released.
     */
    private getOrCreateQueryRunner(requestContext: RequestContext, dataSource: DataSource): QueryRunner {
        const existingManager = (requestContext as any)?.[DB_TRANSACTION_MANAGER_KEY];
        let queryRunner = existingManager?.queryRunner as QueryRunner | undefined;

        if (!queryRunner || queryRunner.isReleased) {
            queryRunner = dataSource.createQueryRunner();
        }

        (requestContext as any)[DB_TRANSACTION_MANAGER_KEY] = queryRunner.manager;

        return queryRunner;
    }

    /**
     * @description
     * Executes the provided callback with a retry strategy for transient errors.
     *
     * Retries are applied only to errors considered retriable
     * (e.g., database deadlocks).
     */
    private async executeWithRetry<T>(
        callback: (ctx: RequestContext) => Promise<T> | Observable<T>,
        ctx: RequestContext,
    ): Promise<T> {
        const maxRetries = 5;
        return lastValueFrom(
            from(callback(ctx)).pipe(
                retryWhen(errors =>
                    errors.pipe(
                        tap(error => {
                            if (!this.isRetriableError(error)) {
                                throw error;
                            }
                        }),
                        take(maxRetries),
                    ),
                ),
            ),
        );
    }

    /**
     * @description
     * Starts a database transaction using the provided {@link QueryRunner}.
     *
     * If a transaction is already active (e.g., nested call),
     * it safely skips starting a new one.
     */
    private async startTransaction(
        queryRunner: QueryRunner,
        isolationLevel?: TransactionIsolationLevel,
    ): Promise<void> {
        try {
            await queryRunner.startTransaction(isolationLevel);
        } catch (error) {
            if (error instanceof TransactionAlreadyStartedError) {
                return;
            }
            throw error;
        }
    }

    /**
     * @description
     * Releases the {@link QueryRunner} if it is no longer needed.
     *
     * Ensures that:
     * - Active transactions are not accidentally released
     * - Nested transactions (savepoints) are respected
     */
    private async releaseQueryRunnerIfNeeded(queryRunner: QueryRunner): Promise<void> {
        if (!queryRunner.isTransactionActive && !queryRunner.isReleased) {
            await queryRunner.release();
        }
    }

    /**
     * @description
     * Determines whether an error is safe to retry.
     *
     * Typically used to detect transient database errors such as deadlocks.
     *
     * @remarks
     * Currently supports:
     * - MySQL deadlocks (`ER_LOCK_DEADLOCK`)
     * - PostgreSQL deadlocks (`deadlock_detected`)
     */
    private isRetriableError(err: any): boolean {
        const mysqlDeadlock = err.code === 'ER_LOCK_DEADLOCK';
        const postgresDeadlock = err.code === 'deadlock_detected';
        return mysqlDeadlock || postgresDeadlock;
    }
}
