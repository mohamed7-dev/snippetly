/**
 * @description
 * Declares the IndexedDB schema and shared database instance for offline features.
 */
import { APP_NAME } from '@snippetly/common/lib';
import Dexie, { type Table } from 'dexie';
import {
    type OfflineCollectionItem,
    type OfflineCollectionMapping,
    type OfflineCollectionOption,
    type OfflineDashboardCacheEntry,
    type OfflineDashboardCacheKind,
    type OfflineSnippetItem,
    type OfflineSyncCredential,
    type OfflineSyncLease,
    type PendingOfflineCollection,
    type PendingOfflineCollectionUpdate,
    type PendingOfflineSnippet,
    type PendingOfflineSnippetUpdate,
} from './store-types';

/** @description Name of the IndexedDB database used by offline features. */
export const SNIPPETLY_OFFLINE_DB_NAME = `${APP_NAME.toLowerCase()}-offline`;
/** @description Maximum number of cached collection options kept per owner. */
export const MAX_CACHED_COLLECTIONS_PER_OWNER = 100;
/** @description Maximum number of cached dashboard snapshots kept per kind. */
export const MAX_DASHBOARD_CACHE_ENTRIES_PER_KIND = 20;
/** @description Maximum number of cached entity detail records kept per owner. */
export const MAX_CACHED_ENTITY_DETAILS_PER_OWNER = 100;
/** @description Default owner key used for offline data saved without an account. */
export const DEFAULT_OFFLINE_SAVED_BY = 'anonymous';

class OfflineSnippetsDatabase extends Dexie {
    explicitSnippets!: Table<OfflineSnippetItem, [string, string]>;
    explicitCollections!: Table<OfflineCollectionItem, [string, string]>;
    cachedCollectionOptions!: Table<OfflineCollectionOption, [string, string]>;
    pendingCollectionCreations!: Table<PendingOfflineCollection, [string, string]>;
    pendingSnippetCreations!: Table<PendingOfflineSnippet, [string, string]>;
    pendingCollectionUpdates!: Table<PendingOfflineCollectionUpdate, [string, string]>;
    pendingSnippetUpdates!: Table<PendingOfflineSnippetUpdate, [string, string]>;
    collectionMappings!: Table<OfflineCollectionMapping, [string, string]>;
    syncCredentials!: Table<OfflineSyncCredential, string>;
    syncLeases!: Table<OfflineSyncLease, string>;
    dashboardCache!: Table<OfflineDashboardCacheEntry, [string, OfflineDashboardCacheKind, string]>;

    /** @description Creates the v1 offline database schema. */
    constructor() {
        super(SNIPPETLY_OFFLINE_DB_NAME);
        this.version(1).stores({
            explicitSnippets: '&[id+savedBy],id,savedBy,language,collectionId,createdAt,collection.name',
            explicitCollections: '&[id+savedBy],id,savedBy,savedAt',
            cachedCollectionOptions: '&[id+ownerId],ownerId,cachedAt',
            pendingCollectionCreations: '&[id+ownerId],ownerId,createdAt',
            pendingSnippetCreations: '&[id+ownerId],ownerId,createdAt',
            pendingCollectionUpdates: '&[id+ownerId],ownerId,createdAt',
            pendingSnippetUpdates: '&[id+ownerId],ownerId,createdAt',
            collectionMappings: '&[localId+ownerId],ownerId',
            syncCredentials: '&ownerId',
            syncLeases: '&ownerId,expiresAt',
            dashboardCache: '&[ownerId+kind+key],[ownerId+kind],ownerId,kind,updatedAt',
        });
    }
}

/** @description The shared Dexie instance used by offline persistence modules. */
export const offlineSnippetlyDb = new OfflineSnippetsDatabase();
