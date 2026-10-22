import type { ApiSuccess } from '@/lib/api-client';
import type {
    CreateCollectionDtoType,
    CreateSnippetDtoType,
    CurrentUserCollectionListDtoType,
    FindOneCollectionDtoType,
    FindOneSnippetDtoType,
    SnippetListDtoType,
    UpdateCollectionDtoType,
    UpdateSnippetDtoType,
} from '@snippetly/common/dto';
import { APP_NAME } from '@snippetly/common/lib';
import Dexie, { type Table } from 'dexie';
import { LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY } from '../../../lib/constants';
import { registerOfflineCreationSync } from './register-background-sync';

export const SNIPPETS_OFFLINE_DB_NAME = `${APP_NAME.toLowerCase()}-offline`;
export const MAX_CACHED_COLLECTIONS_PER_OWNER = 100;
export const MAX_DASHBOARD_CACHE_ENTRIES_PER_KIND = 20;
export const MAX_CACHED_ENTITY_DETAILS_PER_OWNER = 100;

const DEFAULT_SAVED_BY = 'anonymous';

type SnippetListItem = ApiSuccess<SnippetListDtoType['output']>['items'][number];
type CreateCollectionInput = CreateCollectionDtoType['input'];
type CreateSnippetInput = CreateSnippetDtoType['input'];
type UpdateCollectionInput = UpdateCollectionDtoType['input'];
type UpdateSnippetInput = UpdateSnippetDtoType['input'];

export interface OfflineSnippetItem extends Pick<
    SnippetListItem,
    'name' | 'code' | 'language' | 'creator' | 'id' | 'description' | 'note' | 'tags' | 'slug'
> {
    collection?: {
        id?: string;
        name?: string;
        slug?: string;
        color?: string;
    } | null;
    savedAt: Date;
    savedBy?: string;
}

export type InsertOfflineSnippetInput = Omit<OfflineSnippetItem, 'savedAt'>;
export type RemoveOfflineSnippetInput = { id: string; savedBy?: string };
export type UpdateOfflineSnippetInput = Partial<Omit<OfflineSnippetItem, 'id' | 'savedAt' | 'savedBy'>> & {
    id: string;
    savedBy?: string;
};
export type GetOfflineSnippetInput = { id: string; savedBy?: string };

export type OfflineCollectionOption = Pick<
    ApiSuccess<CurrentUserCollectionListDtoType['output']>['items'][number],
    'id' | 'name' | 'color'
> & {
    ownerId: string;
    isPending?: boolean;
    cachedAt?: Date;
};

export type OfflineDashboardCacheKind =
    | 'collections'
    | 'snippets'
    | 'favourite-collections'
    | 'favourite-snippets'
    | 'stats'
    | 'collection-details'
    | 'snippet-details';

type OfflineDashboardCacheEntry = {
    ownerId: string;
    kind: OfflineDashboardCacheKind;
    key: string;
    data: unknown;
    updatedAt: Date;
};

export type PendingOfflineCollection = {
    id: string;
    ownerId: string;
    input: CreateCollectionInput;
    createdAt: Date;
    lastError?: string;
};

export type PendingOfflineSnippet = {
    id: string;
    ownerId: string;
    input: CreateSnippetInput;
    createdAt: Date;
    lastError?: string;
};

export type PendingOfflineCollectionUpdate = {
    id: string;
    ownerId: string;
    input: UpdateCollectionInput;
    createdAt: Date;
    lastError?: string;
};

export type PendingOfflineSnippetUpdate = {
    id: string;
    ownerId: string;
    input: UpdateSnippetInput;
    createdAt: Date;
    lastError?: string;
};

type OfflineCollectionMapping = {
    localId: string;
    ownerId: string;
    serverId: string;
};

export type OfflineSyncCredential = {
    ownerId: string;
    token: string;
    updatedAt: Date;
};

type OfflineSyncLease = {
    ownerId: string;
    leaseId: string;
    expiresAt: number;
};

class OfflineSnippetsDatabase extends Dexie {
    snippets!: Table<OfflineSnippetItem, string>;
    userSnippets!: Table<OfflineSnippetItem, [string, string]>;
    cachedCollections!: Table<OfflineCollectionOption, [string, string]>;
    pendingCollections!: Table<PendingOfflineCollection, [string, string]>;
    pendingSnippets!: Table<PendingOfflineSnippet, [string, string]>;
    pendingCollectionUpdates!: Table<PendingOfflineCollectionUpdate, [string, string]>;
    pendingSnippetUpdates!: Table<PendingOfflineSnippetUpdate, [string, string]>;
    collectionMappings!: Table<OfflineCollectionMapping, [string, string]>;
    syncCredentials!: Table<OfflineSyncCredential, string>;
    syncLeases!: Table<OfflineSyncLease, string>;
    dashboardCache!: Table<OfflineDashboardCacheEntry, [string, OfflineDashboardCacheKind, string]>;

    constructor() {
        super(SNIPPETS_OFFLINE_DB_NAME);

        this.version(1).stores({
            snippets: '&id,savedBy,language,collectionId,createdAt',
        });
        this.version(2).stores({
            snippets: '&id,savedBy,language,collectionId,createdAt,collection.name',
        });
        this.version(3)
            .stores({
                snippets: '&id,savedBy,language,collectionId,createdAt,collection.name',
                userSnippets: '&[id+savedBy],id,savedBy,language,collectionId,createdAt,collection.name',
            })
            .upgrade(async transaction => {
                const existingSnippets = await transaction.table('snippets').toArray();
                await transaction.table('userSnippets').bulkPut(
                    existingSnippets.map(snippet => ({
                        ...snippet,
                        savedBy: snippet.savedBy ?? DEFAULT_SAVED_BY,
                    })),
                );
            });
        this.version(4).stores({
            snippets: '&id,savedBy,language,collectionId,createdAt,collection.name',
            userSnippets: '&[id+savedBy],id,savedBy,language,collectionId,createdAt,collection.name',
            cachedCollections: '&[id+ownerId],ownerId',
            pendingCollections: '&[id+ownerId],ownerId,createdAt',
            pendingSnippets: '&[id+ownerId],ownerId,createdAt',
            collectionMappings: '&[localId+ownerId],ownerId',
        });
        this.version(5).stores({
            snippets: '&id,savedBy,language,collectionId,createdAt,collection.name',
            userSnippets: '&[id+savedBy],id,savedBy,language,collectionId,createdAt,collection.name',
            cachedCollections: '&[id+ownerId],ownerId',
            pendingCollections: '&[id+ownerId],ownerId,createdAt',
            pendingSnippets: '&[id+ownerId],ownerId,createdAt',
            collectionMappings: '&[localId+ownerId],ownerId',
            syncCredentials: '&ownerId',
            syncLeases: '&ownerId,expiresAt',
        });
        this.version(6)
            .stores({
                snippets: '&id,savedBy,language,collectionId,createdAt,collection.name',
                userSnippets: '&[id+savedBy],id,savedBy,language,collectionId,createdAt,collection.name',
                cachedCollections: '&[id+ownerId],ownerId,cachedAt',
                pendingCollections: '&[id+ownerId],ownerId,createdAt',
                pendingSnippets: '&[id+ownerId],ownerId,createdAt',
                collectionMappings: '&[localId+ownerId],ownerId',
                syncCredentials: '&ownerId',
                syncLeases: '&ownerId,expiresAt',
                dashboardCache: '&[ownerId+kind+key],[ownerId+kind],ownerId,kind,updatedAt',
            })
            .upgrade(async transaction => {
                const cachedCollections = await transaction.table('cachedCollections').toArray();
                await transaction.table('cachedCollections').bulkPut(
                    cachedCollections.map(collection => ({
                        ...collection,
                        cachedAt: collection.cachedAt ?? new Date(0),
                    })),
                );
            });
        this.version(7).stores({
            snippets: '&id,savedBy,language,collectionId,createdAt,collection.name',
            userSnippets: '&[id+savedBy],id,savedBy,language,collectionId,createdAt,collection.name',
            cachedCollections: '&[id+ownerId],ownerId,cachedAt',
            pendingCollections: '&[id+ownerId],ownerId,createdAt',
            pendingSnippets: '&[id+ownerId],ownerId,createdAt',
            pendingCollectionUpdates: '&[id+ownerId],ownerId,createdAt',
            pendingSnippetUpdates: '&[id+ownerId],ownerId,createdAt',
            collectionMappings: '&[localId+ownerId],ownerId',
            syncCredentials: '&ownerId',
            syncLeases: '&ownerId,expiresAt',
            dashboardCache: '&[ownerId+kind+key],[ownerId+kind],ownerId,kind,updatedAt',
        });
        this.version(8).stores({
            snippets: '&id,savedBy,language,collectionId,createdAt,collection.name',
            userSnippets: '&[id+savedBy],id,savedBy,language,collectionId,createdAt,collection.name',
            cachedCollections: '&[id+ownerId],ownerId,cachedAt',
            pendingCollections: '&[id+ownerId],ownerId,createdAt',
            pendingSnippets: '&[id+ownerId],ownerId,createdAt',
            pendingCollectionUpdates: '&[id+ownerId],ownerId,createdAt',
            pendingSnippetUpdates: '&[id+ownerId],ownerId,createdAt',
            collectionMappings: '&[localId+ownerId],ownerId',
            syncCredentials: '&ownerId',
            syncLeases: '&ownerId,expiresAt',
            dashboardCache: '&[ownerId+kind+key],[ownerId+kind],ownerId,kind,updatedAt',
        });
    }
}

export const offlineSnippetsDb = new OfflineSnippetsDatabase();

export async function insertOfflineSnippet(snippet: InsertOfflineSnippetInput): Promise<void> {
    const savedBy = snippet.savedBy ?? DEFAULT_SAVED_BY;
    await offlineSnippetsDb.transaction('rw', offlineSnippetsDb.userSnippets, async () => {
        const current = await offlineSnippetsDb.userSnippets.get([snippet.id, savedBy]);
        if (current) return;

        await offlineSnippetsDb.userSnippets.add({
            ...snippet,
            savedAt: new Date(),
            savedBy,
        });
    });
}

export async function removeOfflineSnippet(input: RemoveOfflineSnippetInput): Promise<void> {
    await offlineSnippetsDb.userSnippets.delete([input.id, input.savedBy ?? DEFAULT_SAVED_BY]);
}

export async function updateOfflineSnippet(patch: UpdateOfflineSnippetInput): Promise<void> {
    const savedBy = patch.savedBy ?? DEFAULT_SAVED_BY;
    await offlineSnippetsDb.transaction('rw', offlineSnippetsDb.userSnippets, async () => {
        const current = await offlineSnippetsDb.userSnippets.get([patch.id, savedBy]);
        if (!current) return;

        await offlineSnippetsDb.userSnippets.put({
            ...current,
            ...patch,
            id: current.id,
            savedBy: current.savedBy ?? DEFAULT_SAVED_BY,
            savedAt: current.savedAt,
        });
    });
}

export async function getOfflineSnippet(
    input: GetOfflineSnippetInput,
): Promise<OfflineSnippetItem | undefined> {
    const savedBy = input.savedBy ?? DEFAULT_SAVED_BY;
    return offlineSnippetsDb.userSnippets.get([input.id, savedBy]);
}

export async function listOfflineSnippets(activeUserId?: string): Promise<OfflineSnippetItem[]> {
    return offlineSnippetsDb.userSnippets
        .where('savedBy')
        .equals(activeUserId ?? DEFAULT_SAVED_BY)
        .toArray();
}

export function getOfflineOwnerId(): string | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    return localStorage.getItem(LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY) ?? undefined;
}

export async function cacheOfflineCollectionOptions(collections: OfflineCollectionOption[]): Promise<void> {
    if (collections.length === 0) return;
    const cachedAt = new Date();
    const ownerId = collections[0].ownerId;
    await offlineSnippetsDb.transaction('rw', offlineSnippetsDb.cachedCollections, async () => {
        await offlineSnippetsDb.cachedCollections.bulkPut(
            collections.map(collection => ({ ...collection, cachedAt })),
        );
        const ownerCollections = await offlineSnippetsDb.cachedCollections
            .where('ownerId')
            .equals(ownerId)
            .toArray();
        ownerCollections.sort(
            (left, right) => (right.cachedAt?.getTime() ?? 0) - (left.cachedAt?.getTime() ?? 0),
        );
        const evicted = ownerCollections.slice(MAX_CACHED_COLLECTIONS_PER_OWNER);
        if (evicted.length) {
            await offlineSnippetsDb.cachedCollections.bulkDelete(
                evicted.map(collection => [collection.id, collection.ownerId]),
            );
        }
    });
}

export async function listOfflineCollectionOptions(ownerId: string): Promise<OfflineCollectionOption[]> {
    const [cached, pending] = await Promise.all([
        offlineSnippetsDb.cachedCollections.where('ownerId').equals(ownerId).toArray(),
        offlineSnippetsDb.pendingCollections.where('ownerId').equals(ownerId).toArray(),
    ]);
    const options = new Map(cached.map(collection => [collection.id, collection]));
    for (const collection of pending) {
        options.set(collection.id, {
            id: collection.id,
            name: collection.input.name,
            color: collection.input.color,
            ownerId,
            isPending: true,
        });
    }
    return [...options.values()];
}

export async function cacheOfflineDashboardData(
    ownerId: string,
    kind: OfflineDashboardCacheKind,
    key: string,
    data: unknown,
): Promise<void> {
    await offlineSnippetsDb.transaction('rw', offlineSnippetsDb.dashboardCache, async () => {
        const cachedData = kind === 'collections' ? limitCollectionSnapshot(data) : data;
        await offlineSnippetsDb.dashboardCache.put({
            ownerId,
            kind,
            key,
            data: cachedData,
            updatedAt: new Date(),
        });
        const entries = await offlineSnippetsDb.dashboardCache
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
            await offlineSnippetsDb.dashboardCache.bulkDelete(
                evicted.map(entry => [entry.ownerId, entry.kind, entry.key]),
            );
        }
    });
}

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

function getCollectionSnapshotItemCount(data: unknown): number {
    return typeof data === 'object' && data !== null && 'items' in data && Array.isArray(data.items)
        ? data.items.length
        : 0;
}

async function patchCachedListItems(
    ownerId: string,
    kinds: Array<'collections' | 'snippets' | 'favourite-collections' | 'favourite-snippets'>,
    id: string,
    fields: object,
    tags?: string[],
): Promise<void> {
    for (const kind of kinds) {
        const entries = await offlineSnippetsDb.dashboardCache
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
                await offlineSnippetsDb.dashboardCache.put({
                    ...entry,
                    data: { ...entry.data, items },
                    updatedAt: new Date(),
                });
            }
        }
    }
}

export async function getOfflineDashboardData<TData>(
    ownerId: string,
    kind: OfflineDashboardCacheKind,
    key: string,
): Promise<TData | undefined> {
    return offlineSnippetsDb.transaction('rw', offlineSnippetsDb.dashboardCache, async () => {
        const entry = await offlineSnippetsDb.dashboardCache.get([ownerId, kind, key]);
        if (!entry) return undefined;
        await offlineSnippetsDb.dashboardCache.put({ ...entry, updatedAt: new Date() });
        return entry.data as TData;
    });
}

export async function hasOfflineEditableDashboardData(
    ownerId: string,
    kind: 'snippet-details' | 'collection-details',
    key: string,
): Promise<boolean> {
    return offlineSnippetsDb.transaction('rw', offlineSnippetsDb.dashboardCache, async () => {
        const entry = await offlineSnippetsDb.dashboardCache.get([ownerId, kind, key]);
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
        if (isEditable) await offlineSnippetsDb.dashboardCache.put({ ...entry, updatedAt: new Date() });
        return isEditable;
    });
}

export async function queueOfflineCollectionUpdate(
    ownerId: string,
    input: UpdateCollectionInput,
): Promise<ApiSuccess<UpdateCollectionDtoType['output']>> {
    const updatedAt = new Date();
    const collection = await offlineSnippetsDb.transaction(
        'rw',
        offlineSnippetsDb.dashboardCache,
        offlineSnippetsDb.pendingCollectionUpdates,
        async () => {
            const entry = await offlineSnippetsDb.dashboardCache.get([
                ownerId,
                'collection-details',
                input.id,
            ]);
            if (!entry) {
                throw new Error(`Collection ${input.id} is not available in the offline cache.`);
            }
            const current = entry.data as ApiSuccess<FindOneCollectionDtoType['output']>;
            if (current.creator.id !== ownerId) {
                throw new Error(`Collection ${input.id} is not owned by the signed-in user.`);
            }
            if (!('updatedAt' in current && 'deletedAt' in current)) {
                throw new Error(`Collection ${input.id} is not available for offline editing.`);
            }
            const { tags } = input;
            const fields: Partial<Omit<UpdateCollectionInput, 'id' | 'tags'>> = input;
            const updated = {
                ...current,
                ...fields,
                ...(tags !== undefined ? { tags: tags.map(value => ({ value })) } : {}),
            };
            const pending = await offlineSnippetsDb.pendingCollectionUpdates.get([input.id, ownerId]);
            await offlineSnippetsDb.dashboardCache.put({ ...entry, data: updated, updatedAt });
            await patchCachedListItems(
                ownerId,
                ['collections', 'favourite-collections'],
                input.id,
                fields,
                tags,
            );
            await offlineSnippetsDb.pendingCollectionUpdates.put({
                id: input.id,
                ownerId,
                input: { ...pending?.input, ...input },
                createdAt: pending?.createdAt ?? updatedAt,
            });
            return updated;
        },
    );
    void registerOfflineCreationSync().catch(error => {
        console.error('Could not register background collection update sync.', error);
    });
    return collection;
}

export async function queueOfflineSnippetUpdate(
    ownerId: string,
    input: UpdateSnippetInput,
): Promise<ApiSuccess<UpdateSnippetDtoType['output']>> {
    const updatedAt = new Date();
    const snippet = await offlineSnippetsDb.transaction(
        'rw',
        offlineSnippetsDb.dashboardCache,
        offlineSnippetsDb.pendingSnippetUpdates,
        async () => {
            const entry = await offlineSnippetsDb.dashboardCache.get([ownerId, 'snippet-details', input.id]);
            if (!entry) {
                throw new Error(`Snippet ${input.id} is not available in the offline cache.`);
            }
            const current = entry.data as ApiSuccess<FindOneSnippetDtoType['output']>;
            if (current.creator.id !== ownerId || !('isPrivate' in current)) {
                throw new Error(`Snippet ${input.id} is not available for offline editing.`);
            }
            const { tags, collectionId } = input;
            const fields: Partial<Omit<UpdateSnippetInput, 'id' | 'tags' | 'collectionId'>> = input;
            const updated: ApiSuccess<UpdateSnippetDtoType['output']> = {
                ...current,
                ...fields,
                ...(tags !== undefined ? { tags: tags.map(value => ({ value })) } : {}),
                ...(collectionId !== undefined
                    ? {
                          collection:
                              current.collection?.id === collectionId
                                  ? current.collection
                                  : { id: collectionId, name: '', slug: '', color: '' },
                      }
                    : {}),
            };
            const pending = await offlineSnippetsDb.pendingSnippetUpdates.get([input.id, ownerId]);
            await offlineSnippetsDb.dashboardCache.put({ ...entry, data: updated, updatedAt });
            await patchCachedListItems(
                ownerId,
                ['snippets', 'favourite-snippets'],
                input.id,
                {
                    ...fields,
                    ...(collectionId !== undefined ? { collection: updated.collection } : {}),
                },
                tags,
            );
            await offlineSnippetsDb.pendingSnippetUpdates.put({
                id: input.id,
                ownerId,
                input: { ...pending?.input, ...input },
                createdAt: pending?.createdAt ?? updatedAt,
            });
            return updated;
        },
    );
    void registerOfflineCreationSync().catch(error => {
        console.error('Could not register background snippet update sync.', error);
    });
    return snippet;
}

export async function queueOfflineCollection(
    ownerId: string,
    input: CreateCollectionInput,
): Promise<PendingOfflineCollection> {
    const collection: PendingOfflineCollection = {
        id: crypto.randomUUID(),
        ownerId,
        input,
        createdAt: new Date(),
    };
    await offlineSnippetsDb.pendingCollections.add(collection);
    void registerOfflineCreationSync().catch(error => {
        console.error('Could not register background collection sync.', error);
    });
    return collection;
}

export async function queueOfflineSnippet(
    ownerId: string,
    input: CreateSnippetInput,
): Promise<PendingOfflineSnippet> {
    const snippet: PendingOfflineSnippet = {
        id: crypto.randomUUID(),
        ownerId,
        input,
        createdAt: new Date(),
    };
    await offlineSnippetsDb.pendingSnippets.add(snippet);
    void registerOfflineCreationSync().catch(error => {
        console.error('Could not register background snippet sync.', error);
    });
    return snippet;
}

export async function listPendingOfflineCollections(ownerId: string) {
    return offlineSnippetsDb.pendingCollections.where('ownerId').equals(ownerId).toArray();
}

export async function listPendingOfflineSnippets(ownerId: string) {
    return offlineSnippetsDb.pendingSnippets.where('ownerId').equals(ownerId).toArray();
}

export async function listPendingOfflineCollectionUpdates(ownerId: string) {
    return offlineSnippetsDb.pendingCollectionUpdates.where('ownerId').equals(ownerId).toArray();
}

export async function listPendingOfflineSnippetUpdates(ownerId: string) {
    return offlineSnippetsDb.pendingSnippetUpdates.where('ownerId').equals(ownerId).toArray();
}

export async function listPendingOfflineCreationOwnerIds(): Promise<string[]> {
    const [collections, snippets, collectionUpdates, snippetUpdates] = await Promise.all([
        offlineSnippetsDb.pendingCollections.toArray(),
        offlineSnippetsDb.pendingSnippets.toArray(),
        offlineSnippetsDb.pendingCollectionUpdates.toArray(),
        offlineSnippetsDb.pendingSnippetUpdates.toArray(),
    ]);
    return [
        ...new Set(
            [...collections, ...snippets, ...collectionUpdates, ...snippetUpdates].map(item => item.ownerId),
        ),
    ];
}

export async function updatePendingOfflineCollection(
    collection: PendingOfflineCollection,
    lastError: string,
): Promise<void> {
    await offlineSnippetsDb.pendingCollections.put({ ...collection, lastError });
}

export async function updatePendingOfflineSnippet(
    snippet: PendingOfflineSnippet,
    lastError: string,
): Promise<void> {
    await offlineSnippetsDb.pendingSnippets.put({ ...snippet, lastError });
}

export async function updatePendingOfflineCollectionUpdate(
    update: PendingOfflineCollectionUpdate,
    lastError: string,
): Promise<void> {
    await offlineSnippetsDb.pendingCollectionUpdates.put({ ...update, lastError });
}

export async function updatePendingOfflineSnippetUpdate(
    update: PendingOfflineSnippetUpdate,
    lastError: string,
): Promise<void> {
    await offlineSnippetsDb.pendingSnippetUpdates.put({ ...update, lastError });
}

export async function completePendingOfflineCollectionUpdate(
    update: PendingOfflineCollectionUpdate,
): Promise<void> {
    await offlineSnippetsDb.pendingCollectionUpdates.delete([update.id, update.ownerId]);
}

export async function completePendingOfflineSnippetUpdate(
    update: PendingOfflineSnippetUpdate,
): Promise<void> {
    await offlineSnippetsDb.pendingSnippetUpdates.delete([update.id, update.ownerId]);
}

export async function completePendingOfflineCollection(
    collection: PendingOfflineCollection,
    serverId: string,
    serverColor: string,
): Promise<void> {
    await offlineSnippetsDb.transaction(
        'rw',
        offlineSnippetsDb.cachedCollections,
        offlineSnippetsDb.pendingCollections,
        offlineSnippetsDb.pendingSnippets,
        offlineSnippetsDb.collectionMappings,
        async () => {
            await offlineSnippetsDb.cachedCollections.put({
                id: serverId,
                name: collection.input.name,
                color: serverColor,
                ownerId: collection.ownerId,
            });
            await offlineSnippetsDb.collectionMappings.put({
                localId: collection.id,
                ownerId: collection.ownerId,
                serverId,
            });
            const dependentSnippets = await offlineSnippetsDb.pendingSnippets
                .where('ownerId')
                .equals(collection.ownerId)
                .toArray();
            await Promise.all(
                dependentSnippets
                    .filter(snippet => snippet.input.collectionId === collection.id)
                    .map(snippet =>
                        offlineSnippetsDb.pendingSnippets.put({
                            ...snippet,
                            input: { ...snippet.input, collectionId: serverId },
                        }),
                    ),
            );
            await offlineSnippetsDb.pendingCollections.delete([collection.id, collection.ownerId]);
        },
    );
}

export async function completePendingOfflineSnippet(snippet: PendingOfflineSnippet): Promise<void> {
    await offlineSnippetsDb.pendingSnippets.delete([snippet.id, snippet.ownerId]);
}

export async function resolveOfflineCollectionId(
    ownerId: string,
    collectionId: string | undefined,
): Promise<string | undefined> {
    if (!collectionId) return undefined;
    const mapping = await offlineSnippetsDb.collectionMappings.get([collectionId, ownerId]);
    if (mapping) return mapping.serverId;

    const pending = await offlineSnippetsDb.pendingCollections.get([collectionId, ownerId]);
    return pending ? undefined : collectionId;
}

export async function hasPendingOfflineCollection(ownerId: string, collectionId: string): Promise<boolean> {
    return !!(await offlineSnippetsDb.pendingCollections.get([collectionId, ownerId]));
}

export async function saveOfflineSyncCredential(ownerId: string, token: string): Promise<void> {
    await offlineSnippetsDb.syncCredentials.put({ ownerId, token, updatedAt: new Date() });
}

export async function getOfflineSyncCredential(ownerId: string): Promise<OfflineSyncCredential | undefined> {
    return offlineSnippetsDb.syncCredentials.get(ownerId);
}

export async function removeOfflineSyncCredential(ownerId: string): Promise<void> {
    await offlineSnippetsDb.syncCredentials.delete(ownerId);
}

export async function acquireOfflineSyncLease(
    ownerId: string,
    leaseId: string,
    durationMs: number,
): Promise<boolean> {
    return offlineSnippetsDb.transaction('rw', offlineSnippetsDb.syncLeases, async () => {
        const existingLease = await offlineSnippetsDb.syncLeases.get(ownerId);
        if (existingLease && existingLease.expiresAt > Date.now()) return false;

        await offlineSnippetsDb.syncLeases.put({
            ownerId,
            leaseId,
            expiresAt: Date.now() + durationMs,
        });
        return true;
    });
}

export async function releaseOfflineSyncLease(ownerId: string, leaseId: string): Promise<void> {
    await offlineSnippetsDb.transaction('rw', offlineSnippetsDb.syncLeases, async () => {
        const existingLease = await offlineSnippetsDb.syncLeases.get(ownerId);
        if (existingLease?.leaseId === leaseId) {
            await offlineSnippetsDb.syncLeases.delete(ownerId);
        }
    });
}
