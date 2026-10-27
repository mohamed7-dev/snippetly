/**
 * @description
 * Fetches dashboard data from the API and serves cached data when the network is unavailable.
 */
import { OfflineDataUnavailableError, isOfflineNetworkError } from '../../../lib/api-client';
import { getOfflineOwnerId } from './common';
import {
    cacheOfflineDashboardData,
    getOfflineDashboardData,
} from './offline-storage/offline-dashboard-storage';
import type { OfflineDashboardCacheKind } from './offline-storage/store-types';

/**
 * @description
 * Fetches and caches data, falling back to the owner's cached snapshot on network failures.
 */
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

/**
 * @description
 * Extracts an entity's creator ID from an unknown dashboard response.
 * @internal
 */
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
