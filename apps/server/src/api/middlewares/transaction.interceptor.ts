import { RequestHandler } from 'express';
import { DatabaseService } from '../../infra/database/database.service';
import { TransactionManagerService } from '../../infra/database/transaction-manager.service';
import { iocContainer } from '../../infra/ioc-container/ioc-container';
import { attachRequestContext, resolveRequestContext } from '../request-context/utils';
import { Interceptor } from './define-router-pipeline.mw';

/**
 * @description
 * Defines how a transaction should be managed.
 *
 * - `auto`: The transaction is automatically started and managed
 *   by the {@link TransactionInterceptor}.
 * - `manual`: The transaction lifecycle is controlled manually
 *   inside the business logic.
 */
export type TransactionMode = 'auto' | 'manual';

/**
 * @description
 * Supported database transaction isolation levels.
 *
 * These levels control how concurrent transactions interact
 * and the degree of visibility of uncommitted data.
 *
 * @remarks
 * - `READ UNCOMMITTED`: Allows dirty reads.
 * - `READ COMMITTED`: Prevents dirty reads.
 * - `REPEATABLE READ`: Ensures consistent reads within a transaction.
 * - `SERIALIZABLE`: Highest isolation level, fully prevents concurrency anomalies.
 */
export type TransactionIsolationLevel =
    | 'READ UNCOMMITTED'
    | 'READ COMMITTED'
    | 'REPEATABLE READ'
    | 'SERIALIZABLE';

export interface TransactionOptions {
    mode?: TransactionMode;
    isolationLevel?: TransactionIsolationLevel;
}

export function withTransaction(options?: TransactionOptions): RequestHandler {
    return async (req, res, next) => {
        try {
            const requestContext = resolveRequestContext(req);

            if (!requestContext) return next();

            const txManagerService =
                iocContainer.resolve<TransactionManagerService>(TransactionManagerService);

            const databaseService = iocContainer.resolve<DatabaseService>(DatabaseService);

            await txManagerService.runInTransaction(
                requestContext,
                async requestContext => {
                    attachRequestContext(req, requestContext);
                    return new Promise<void>((resolve, reject) => {
                        // resolve AFTER whole express chain
                        res.once('finish', resolve);
                        res.once('close', resolve);
                        res.once('error', reject);
                        next();
                    });
                },
                databaseService.dataSource,
                {
                    isolationLevel: options?.isolationLevel,
                    transactionMode: options?.mode ?? 'auto',
                },
            );
        } catch (err) {
            next(err);
        }
    };
}

export function transactionInterceptor(opts?: TransactionOptions): Interceptor {
    return handler => (req, res, next) =>
        withTransaction(opts)(req, res, err => {
            if (err) return next(err);
            handler(req, res, next);
        });
}
