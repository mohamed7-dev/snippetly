import type {
    CreateCollectionDtoType,
    CreateSnippetDtoType,
    UpdateCollectionDtoType,
    UpdateSnippetDtoType,
} from '@snippetly/common/dto';
import { developerApiClient } from '../../../lib/api-client';
import { apiEndpoints } from '../../../lib/api-endpoints';
import {
    completePendingOfflineCollectionCreations,
    completePendingOfflineSnippetCreations,
    hasPendingOfflineCollectionCreations,
    listPendingOfflineCollectionCreations,
    listPendingOfflineSnippetCreations,
    resolveOfflineCollectionId,
    updatePendingOfflineCollectionCreations,
    updatePendingOfflineSnippetCreations,
} from './offline-storage/offline-creation-queue';
import {
    completePendingOfflineCollectionUpdate,
    completePendingOfflineSnippetUpdate,
    listPendingOfflineCollectionUpdates,
    listPendingOfflineSnippetUpdates,
    updatePendingOfflineCollectionUpdate,
    updatePendingOfflineSnippetUpdate,
} from './offline-storage/offline-edit-queue';
import {
    acquireOfflineSyncLease,
    releaseOfflineSyncLease,
    saveOfflineSyncCredential,
} from './offline-storage/offline-sync-state';

type SyncResult = {
    collections: number;
    snippets: number;
    hasPending: boolean;
    retryableFailure: boolean;
};

const FALLBACK_LEASE_DURATION_MS = 5 * 60 * 1000;

export function syncPendingMutations(
    ownerId: string,
    token: string,
    onTokenRefresh?: (token: string) => void | Promise<void>,
): Promise<SyncResult> {
    const execute = () => performSync(ownerId, token, onTokenRefresh);
    if (navigator.locks) {
        return navigator.locks
            .request<Promise<SyncResult>>(`snippetly-offline-sync:${ownerId}`, { mode: 'exclusive' }, () =>
                execute(),
            )
            .then(result => result);
    }

    return withIndexedDbLease(ownerId, execute);
}

async function withIndexedDbLease(ownerId: string, execute: () => Promise<SyncResult>) {
    const leaseId = crypto.randomUUID();
    const acquired = await acquireOfflineSyncLease(ownerId, leaseId, FALLBACK_LEASE_DURATION_MS);
    if (!acquired) return pendingSyncResult();
    try {
        return await execute();
    } finally {
        await releaseOfflineSyncLease(ownerId, leaseId);
    }
}

function pendingSyncResult(): SyncResult {
    return { collections: 0, snippets: 0, hasPending: true, retryableFailure: true };
}

async function performSync(
    ownerId: string,
    token: string,
    onTokenRefresh?: (token: string) => void | Promise<void>,
): Promise<SyncResult> {
    const result: SyncResult = {
        collections: 0,
        snippets: 0,
        hasPending: false,
        retryableFailure: false,
    };
    if (!navigator.onLine) {
        result.hasPending = true;
        result.retryableFailure = true;
        return result;
    }

    const collections = await listPendingOfflineCollectionCreations(ownerId);
    for (const collection of collections) {
        if (!navigator.onLine) {
            result.hasPending = true;
            result.retryableFailure = true;
            return result;
        }
        try {
            const created = await developerApiClient.fetchWithToken<CreateCollectionDtoType['output']>(
                apiEndpoints.collections.create.url,
                {
                    method: apiEndpoints.collections.create.method,
                    body: JSON.stringify(collection.input),
                },
                token,
                refreshedToken => {
                    token = refreshedToken;
                    return (onTokenRefresh ?? (value => saveOfflineSyncCredential(ownerId, value)))(
                        refreshedToken,
                    );
                },
            );
            await completePendingOfflineCollectionCreations(collection, created.id, created.color);
            result.collections++;
        } catch (error) {
            await updatePendingOfflineCollectionCreations(
                collection,
                error instanceof Error ? error.message : 'Unknown error while syncing collection.',
            );
            result.hasPending = true;
            result.retryableFailure ||= isRetryableFailure(error);
        }
    }

    const snippets = await listPendingOfflineSnippetCreations(ownerId);
    for (const snippet of snippets) {
        if (!navigator.onLine) {
            result.hasPending = true;
            result.retryableFailure = true;
            return result;
        }
        if (
            snippet.input.collectionId &&
            (await hasPendingOfflineCollectionCreations(ownerId, snippet.input.collectionId))
        ) {
            continue;
        }

        try {
            const collectionId = await resolveOfflineCollectionId(ownerId, snippet.input.collectionId);
            if (snippet.input.collectionId && !collectionId) continue;

            await developerApiClient.fetchWithToken<CreateSnippetDtoType['output']>(
                apiEndpoints.snippets.create.url,
                {
                    method: apiEndpoints.snippets.create.method,
                    body: JSON.stringify({ ...snippet.input, collectionId }),
                },
                token,
                refreshedToken => {
                    token = refreshedToken;
                    return (onTokenRefresh ?? (value => saveOfflineSyncCredential(ownerId, value)))(
                        refreshedToken,
                    );
                },
            );
            await completePendingOfflineSnippetCreations(snippet);
            result.snippets++;
        } catch (error) {
            await updatePendingOfflineSnippetCreations(
                snippet,
                error instanceof Error ? error.message : 'Unknown error while syncing snippet.',
            );
            result.hasPending = true;
            result.retryableFailure ||= isRetryableFailure(error);
        }
    }

    const collectionUpdates = await listPendingOfflineCollectionUpdates(ownerId);
    for (const update of collectionUpdates) {
        if (!navigator.onLine) {
            result.hasPending = true;
            result.retryableFailure = true;
            return result;
        }
        try {
            const { id, ...input } = update.input;
            await developerApiClient.fetchWithToken<UpdateCollectionDtoType['output']>(
                apiEndpoints.collections.update.url(id),
                {
                    method: apiEndpoints.collections.update.method,
                    body: JSON.stringify(input),
                },
                token,
                refreshedToken => {
                    token = refreshedToken;
                    return (onTokenRefresh ?? (value => saveOfflineSyncCredential(ownerId, value)))(
                        refreshedToken,
                    );
                },
            );
            await completePendingOfflineCollectionUpdate(update);
        } catch (error) {
            await updatePendingOfflineCollectionUpdate(
                update,
                error instanceof Error ? error.message : 'Unknown error while syncing collection update.',
            );
            result.hasPending = true;
            result.retryableFailure ||= isRetryableFailure(error);
        }
    }

    const snippetUpdates = await listPendingOfflineSnippetUpdates(ownerId);
    for (const update of snippetUpdates) {
        if (!navigator.onLine) {
            result.hasPending = true;
            result.retryableFailure = true;
            return result;
        }
        try {
            const { id, ...input } = update.input;
            const collectionId =
                input.collectionId === undefined
                    ? undefined
                    : await resolveOfflineCollectionId(ownerId, input.collectionId);
            if (input.collectionId && !collectionId) {
                result.hasPending = true;
                continue;
            }
            await developerApiClient.fetchWithToken<UpdateSnippetDtoType['output']>(
                apiEndpoints.snippets.update.url(id),
                {
                    method: apiEndpoints.snippets.update.method,
                    body: JSON.stringify({
                        ...input,
                        ...(input.collectionId !== undefined ? { collectionId } : {}),
                    }),
                },
                token,
                refreshedToken => {
                    token = refreshedToken;
                    return (onTokenRefresh ?? (value => saveOfflineSyncCredential(ownerId, value)))(
                        refreshedToken,
                    );
                },
            );
            await completePendingOfflineSnippetUpdate(update);
        } catch (error) {
            await updatePendingOfflineSnippetUpdate(
                update,
                error instanceof Error ? error.message : 'Unknown error while syncing snippet update.',
            );
            result.hasPending = true;
            result.retryableFailure ||= isRetryableFailure(error);
        }
    }

    const [remainingCollections, remainingSnippets, remainingCollectionUpdates, remainingSnippetUpdates] =
        await Promise.all([
            listPendingOfflineCollectionCreations(ownerId),
            listPendingOfflineSnippetCreations(ownerId),
            listPendingOfflineCollectionUpdates(ownerId),
            listPendingOfflineSnippetUpdates(ownerId),
        ]);
    result.hasPending ||=
        remainingCollections.length > 0 ||
        remainingSnippets.length > 0 ||
        remainingCollectionUpdates.length > 0 ||
        remainingSnippetUpdates.length > 0;
    return result;
}

function isRetryableFailure(error: unknown): boolean {
    if (error instanceof TypeError) return true;
    return (
        typeof error === 'object' &&
        error !== null &&
        'httpStatusCode' in error &&
        (error.httpStatusCode === 408 ||
            error.httpStatusCode === 429 ||
            (typeof error.httpStatusCode === 'number' && error.httpStatusCode >= 500))
    );
}
