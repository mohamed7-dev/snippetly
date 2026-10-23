/**
 * @description
 * Stores and retrieves bounded dashboard snapshots and entity details for offline use.
 */
import {
    MAX_CACHED_COLLECTIONS_PER_OWNER,
    MAX_CACHED_ENTITY_DETAILS_PER_OWNER,
    MAX_DASHBOARD_CACHE_ENTRIES_PER_KIND,
    offlineSnippetlyDb,
} from './offline-database';
import type { OfflineDashboardCacheEntry, OfflineDashboardCacheKind } from './store-types';

/**
 * @description
 * Stores dashboard data and evicts older or over-limit snapshots for the same owner and kind.
 */
export async function cacheOfflineDashboardData(
    ownerId: string,
    kind: OfflineDashboardCacheKind,
    key: string,
    data: unknown,
): Promise<void> {
    await offlineSnippetlyDb.transaction('rw', offlineSnippetlyDb.dashboardCache, async () => {
        const cachedData = kind === 'collections' ? limitCollectionSnapshot(data) : data;
        await offlineSnippetlyDb.dashboardCache.put({
            ownerId,
            kind,
            key,
            data: cachedData,
            updatedAt: new Date(),
        });
        const entries = await offlineSnippetlyDb.dashboardCache
            .where('[ownerId+kind]')
            .equals([ownerId, kind])
            .sortBy('updatedAt');
        entries.reverse();
        let cachedItemCount = 0;
        const retained: OfflineDashboardCacheEntry[] = [];
        const evicted: OfflineDashboardCacheEntry[] = [];
        const maxEntries =
            kind === 'snippet-details' || kind === 'collection-details'
                ? MAX_CACHED_ENTITY_DETAILS_PER_OWNER
                : MAX_DASHBOARD_CACHE_ENTRIES_PER_KIND;
        for (const entry of entries) {
            const itemCount = kind === 'collections' ? getCollectionSnapshotItemCount(entry.data) : 0;
            if (
                retained.length >= maxEntries ||
                cachedItemCount + itemCount > MAX_CACHED_COLLECTIONS_PER_OWNER
            ) {
                evicted.push(entry);
                continue;
            }
            retained.push(entry);
            cachedItemCount += itemCount;
        }
        if (evicted.length) {
            await offlineSnippetlyDb.dashboardCache.bulkDelete(
                evicted.map(entry => [entry.ownerId, entry.kind, entry.key]),
            );
        }
    });
}

/**
 * @description
 * Retrieves an offline dashboard snapshot and refreshes its recency timestamp.
 */
export async function getOfflineDashboardData<TData>(
    ownerId: string,
    kind: OfflineDashboardCacheKind,
    key: string,
): Promise<TData | undefined> {
    return offlineSnippetlyDb.transaction('rw', offlineSnippetlyDb.dashboardCache, async () => {
        const entry = await offlineSnippetlyDb.dashboardCache.get([ownerId, kind, key]);
        if (!entry) return undefined;
        await offlineSnippetlyDb.dashboardCache.put({ ...entry, updatedAt: new Date() });
        return entry.data as TData;
    });
}

/**
 * @description
 * Checks whether a cached detail is owned by the user and has the fields required for offline editing.
 */
export async function hasOfflineEditableDashboardData(
    ownerId: string,
    kind: 'snippet-details' | 'collection-details',
    key: string,
): Promise<boolean> {
    return offlineSnippetlyDb.transaction('rw', offlineSnippetlyDb.dashboardCache, async () => {
        const entry = await offlineSnippetlyDb.dashboardCache.get([ownerId, kind, key]);
        if (!entry || typeof entry.data !== 'object' || entry.data === null || !('creator' in entry.data)) {
            return false;
        }
        const data = entry.data;
        if (
            typeof data.creator !== 'object' ||
            data.creator === null ||
            !('id' in data.creator) ||
            data.creator.id !== ownerId
        ) {
            return false;
        }
        const isEditable =
            kind === 'snippet-details' ? 'isPrivate' in data : 'updatedAt' in data && 'deletedAt' in data;
        if (isEditable) await offlineSnippetlyDb.dashboardCache.put({ ...entry, updatedAt: new Date() });
        return isEditable;
    });
}

/**
 * @description
 * Updates matching items in cached list snapshots after an offline entity edit.
 * @internal
 */
export async function patchCachedListItems(
    ownerId: string,
    kinds: Array<'collections' | 'snippets' | 'favourite-collections' | 'favourite-snippets'>,
    id: string,
    fields: object,
    tags?: string[],
): Promise<void> {
    for (const kind of kinds) {
        const entries = await offlineSnippetlyDb.dashboardCache
            .where('[ownerId+kind]')
            .equals([ownerId, kind])
            .toArray();
        for (const entry of entries) {
            if (
                typeof entry.data !== 'object' ||
                entry.data === null ||
                !('items' in entry.data) ||
                !Array.isArray(entry.data.items)
            ) {
                continue;
            }
            let changed = false;
            const items = entry.data.items.map(item => {
                if (typeof item !== 'object' || item === null || !('id' in item) || item.id !== id) {
                    return item;
                }
                changed = true;
                return {
                    ...item,
                    ...fields,
                    ...(tags !== undefined ? { tags: tags.map(value => ({ value })) } : {}),
                };
            });
            if (changed) {
                await offlineSnippetlyDb.dashboardCache.put({
                    ...entry,
                    data: { ...entry.data, items },
                    updatedAt: new Date(),
                });
            }
        }
    }
}

/**
 * @description
 * Limits cached collection-list snapshots to the offline collection budget.
 * @internal
 */
function limitCollectionSnapshot(data: unknown): unknown {
    if (
        typeof data !== 'object' ||
        data === null ||
        !('items' in data) ||
        !Array.isArray(data.items) ||
        data.items.length <= MAX_CACHED_COLLECTIONS_PER_OWNER
    ) {
        return data;
    }
    return {
        ...data,
        items: data.items.slice(0, MAX_CACHED_COLLECTIONS_PER_OWNER),
        itemsCount: MAX_CACHED_COLLECTIONS_PER_OWNER,
    };
}

/**
 * @description
 * Returns the number of list items in a cached collection snapshot.
 * @internal
 */
function getCollectionSnapshotItemCount(data: unknown): number {
    return typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)
        ? data.items.length
        : 0;
}
