/**
 * @description
 * Shared types for the offline IndexedDB store and its purpose-specific operations.
 */
import type { ApiSuccess } from '@/lib/api-client';
import type {
    CollectionListDtoType,
    CreateCollectionDtoType,
    CreateSnippetDtoType,
    CurrentUserCollectionListDtoType,
    SnippetListDtoType,
    UpdateCollectionDtoType,
    UpdateSnippetDtoType,
} from '@snippetly/common/dto';

type SnippetListItem = ApiSuccess<SnippetListDtoType['output']>['items'][number];
type CollectionListItem = ApiSuccess<CollectionListDtoType['output']>['items'][number];

/** @description A locally saved snippet, scoped to the developer who saved it. */
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

/** @description A locally saved collection, scoped to the developer who saved it. */
export type OfflineCollectionItem = Omit<CollectionListItem, 'snippets'> & {
    snippets?: OfflineSnippetItem[];
    savedAt: Date;
    savedBy?: string;
};

/** @description Input used when saving a snippet for offline access. */
export type InsertOfflineSnippetInput = Omit<OfflineSnippetItem, 'savedAt'>;
/** @description Identity of a saved snippet to remove. */
export type RemoveOfflineSnippetInput = { id: string; savedBy?: string };
/** @description Partial data used to update a locally saved snippet. */
export type UpdateOfflineSnippetInput = Partial<Omit<OfflineSnippetItem, 'id' | 'savedAt' | 'savedBy'>> & {
    id: string;
    savedBy?: string;
};
/** @description Identity of a saved snippet to retrieve. */
export type GetOfflineSnippetInput = { id: string; savedBy?: string };
/** @description Input used when saving a collection for offline access. */
export type InsertOfflineCollectionInput = Omit<OfflineCollectionItem, 'savedAt' | 'snippets'> & {
    snippets?: OfflineSnippetItem[];
};
/** @description Identity of a saved collection to retrieve or remove. */
export type GetOfflineCollectionInput = { id: string; savedBy?: string };

/** @description Lightweight collection data available to offline creation forms. */
export type OfflineCollectionOption = Pick<
    ApiSuccess<CurrentUserCollectionListDtoType['output']>['items'][number],
    'id' | 'name' | 'color'
> & {
    ownerId: string;
    isPending?: boolean;
    cachedAt?: Date;
};

/** @description Kinds of dashboard data stored for offline use. */
export type OfflineDashboardCacheKind =
    | 'collections'
    | 'snippets'
    | 'favourite-collections'
    | 'favourite-snippets'
    | 'stats'
    | 'collection-details'
    | 'snippet-details';

/** @description An offline collection awaiting server creation. */
export type PendingOfflineCollection = {
    id: string;
    ownerId: string;
    input: CreateCollectionDtoType['input'];
    createdAt: Date;
    lastError?: string;
};

/** @description An offline snippet awaiting server creation. */
export type PendingOfflineSnippet = {
    id: string;
    ownerId: string;
    input: CreateSnippetDtoType['input'];
    createdAt: Date;
    lastError?: string;
};

/** @description An offline collection update awaiting server synchronization. */
export type PendingOfflineCollectionUpdate = {
    id: string;
    ownerId: string;
    input: UpdateCollectionDtoType['input'];
    createdAt: Date;
    lastError?: string;
};

/** @description An offline snippet update awaiting server synchronization. */
export type PendingOfflineSnippetUpdate = {
    id: string;
    ownerId: string;
    input: UpdateSnippetDtoType['input'];
    createdAt: Date;
    lastError?: string;
};

/** @description A mapping from an offline collection ID to its server-assigned ID. */
export type OfflineCollectionMapping = {
    localId: string;
    ownerId: string;
    serverId: string;
};

/** @description A credential used by the service worker to sync offline changes. */
export type OfflineSyncCredential = {
    ownerId: string;
    token: string;
    updatedAt: Date;
};

/** @description A lease preventing multiple workers from syncing the same owner concurrently. */
export type OfflineSyncLease = {
    ownerId: string;
    leaseId: string;
    expiresAt: number;
};

/** @description An entry in the offline dashboard cache. */
export type OfflineDashboardCacheEntry = {
    ownerId: string;
    kind: OfflineDashboardCacheKind;
    key: string;
    data: unknown;
    updatedAt: Date;
};
