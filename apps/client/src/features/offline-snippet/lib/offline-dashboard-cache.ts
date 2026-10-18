import { OfflineDataUnavailableError, isOfflineNetworkError } from '../../../lib/api-client';
import {
    cacheOfflineDashboardData,
    getOfflineDashboardData,
    getOfflineOwnerId,
    type OfflineDashboardCacheKind,
} from './store';

export async function fetchAndCacheDashboardData<TData>(
    kind: OfflineDashboardCacheKind,
    key: string,
    fetcher: () => Promise<TData>,
): Promise<TData> {
    try {
        const data = await fetcher();
        const ownerId =
            getOfflineOwnerId() ??
            (kind === 'collection-details' || kind === 'snippet-details'
                ? getEntityCreatorId(data)
                : undefined);
        if (ownerId) {
            try {
                await cacheOfflineDashboardData(ownerId, kind, key, data);
            } catch (error) {
                console.error(`Could not cache offline dashboard ${kind} data.`, error);
            }
        }
        return data;
    } catch (error) {
        if (!isOfflineNetworkError(error)) throw error;
        const ownerId = getOfflineOwnerId();
        if (ownerId) {
            const cached = await getOfflineDashboardData<TData>(ownerId, kind, key);
            if (cached !== undefined) return cached;
        }
        throw new OfflineDataUnavailableError();
    }
}

function getEntityCreatorId(data: unknown): string | undefined {
    if (
        typeof data !== 'object' ||
        data === null ||
        !('creator' in data) ||
        typeof data.creator !== 'object' ||
        data.creator === null ||
        !('id' in data.creator) ||
        typeof data.creator.id !== 'string'
    ) {
        return undefined;
    }
    return data.creator.id;
}
