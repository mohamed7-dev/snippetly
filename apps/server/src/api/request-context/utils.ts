import { Request } from 'express';
import { EntityManager } from 'typeorm';
import { DB_TRANSACTION_MANAGER_KEY, REQUEST_CONTEXT_KEY } from '../../common/constants/keys';
import { RequestContext } from './request-context';

/**
 * @description
 * Holds one or more context instances associated with a single execution flow.
 *
 * A bucket may contain a default context and, when applicable,
 * an alternative context tied to additional execution state
 * such as transactional behavior.
 */
export interface RequestContextBucket {
    /**
     * Primary context instance used for the current execution.
     */
    base: RequestContext;
    /**
     * Optional context variant associated with extended execution state.
     */
    transactional?: RequestContext;
}

export function attachRequestContext(req: Request, requestContext: RequestContext): void {
    let bucket: RequestContextBucket | undefined = (req as any)[REQUEST_CONTEXT_KEY];

    const hasTx = Object.getOwnPropertySymbols(requestContext).includes(DB_TRANSACTION_MANAGER_KEY);
    if (!bucket) {
        bucket = { base: requestContext };
        if (hasTx) bucket.transactional = requestContext;
    } else {
        bucket.base ??= requestContext;
        if (hasTx) bucket.transactional = requestContext;
    }

    (req as any)[REQUEST_CONTEXT_KEY] = bucket ?? { base: requestContext };
}

export function resolveRequestContext(req: Request): RequestContext {
    let bucket: RequestContextBucket | undefined = (req as any)[REQUEST_CONTEXT_KEY];

    const txMgr = (bucket?.transactional as any)?.[DB_TRANSACTION_MANAGER_KEY] as EntityManager | undefined;

    if (txMgr?.queryRunner?.isReleased === false) {
        return bucket!.transactional!;
    }

    if (!bucket?.base) {
        throw new Error('RequestContext missing. Did authGuard run?');
    }

    return bucket.base;
}
