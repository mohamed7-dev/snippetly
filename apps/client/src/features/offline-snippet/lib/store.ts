/**
 * @description
 * Backward-compatible public exports for the offline persistence modules.
 * New code should import operations from their purpose-specific module.
 */
export { getOfflineOwnerId, listPendingOfflineOwnerIds } from './common';
export {
    cacheOfflineCollectionOptions,
    listOfflineCollectionOptions,
} from './offline-storage/offline-collection-options-storage';
export {
    completePendingOfflineCollectionCreations,
    completePendingOfflineSnippetCreations,
    hasPendingOfflineCollectionCreations,
    listPendingOfflineCollectionCreations,
    listPendingOfflineSnippetCreations,
    queueOfflineCollectionCreation,
    queueOfflineSnippetCreation,
    resolveOfflineCollectionId,
    updatePendingOfflineCollectionCreations,
    updatePendingOfflineSnippetCreations,
} from './offline-storage/offline-creation-queue';
export {
    completePendingOfflineCollectionUpdate,
    completePendingOfflineSnippetUpdate,
    listPendingOfflineCollectionUpdates,
    listPendingOfflineSnippetUpdates,
    queueOfflineCollectionUpdate,
    queueOfflineSnippetUpdate,
    updatePendingOfflineCollectionUpdate,
    updatePendingOfflineSnippetUpdate,
} from './offline-storage/offline-edit-queue';
export {
    getExplicitOfflineCollection,
    insertExplicitOfflineCollection,
    listExplicitOfflineCollections,
    removeExplicitOfflineCollection,
} from './offline-storage/offline-explicit-collection-storage';

export {
    cacheOfflineDashboardData,
    getOfflineDashboardData,
    hasOfflineEditableDashboardData,
} from './offline-storage/offline-dashboard-storage';
export {
    DEFAULT_OFFLINE_SAVED_BY,
    MAX_CACHED_COLLECTIONS_PER_OWNER,
    MAX_CACHED_ENTITY_DETAILS_PER_OWNER,
    MAX_DASHBOARD_CACHE_ENTRIES_PER_KIND,
    SNIPPETLY_OFFLINE_DB_NAME,
    offlineSnippetlyDb as offlineSnippetsDb,
} from './offline-storage/offline-database';
export {
    getExplicitOfflineSnippet,
    insertExplicitOfflineSnippet,
    listExplicitOfflineSnippets,
    removeExplicitOfflineSnippet,
    updateExplicitOfflineSnippet,
} from './offline-storage/offline-explicit-snippet-storage';
export {
    acquireOfflineSyncLease,
    getOfflineSyncCredential,
    releaseOfflineSyncLease,
    removeOfflineSyncCredential,
    saveOfflineSyncCredential,
} from './offline-storage/offline-sync-state';
export type {
    GetOfflineCollectionInput,
    GetOfflineSnippetInput,
    InsertOfflineCollectionInput,
    InsertOfflineSnippetInput,
    OfflineCollectionItem,
    OfflineCollectionOption,
    OfflineDashboardCacheKind,
    OfflineSnippetItem,
    OfflineSyncCredential,
    PendingOfflineCollection,
    PendingOfflineCollectionUpdate,
    PendingOfflineSnippet,
    PendingOfflineSnippetUpdate,
    RemoveOfflineSnippetInput,
    UpdateOfflineSnippetInput,
} from './offline-storage/store-types';
