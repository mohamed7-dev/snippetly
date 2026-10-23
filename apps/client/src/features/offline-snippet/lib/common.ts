import { LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY } from '@/lib/constants';
import { offlineSnippetlyDb } from './offline-storage/offline-database';

/**
 * @description
 * Reads the active offline owner ID from local storage when available.
 */
export function getOfflineOwnerId(): string | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    return localStorage.getItem(LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY) ?? undefined;
}

/**
 * @description
 * Returns every owner with at least one queued offline creation or update.
 */
export async function listPendingOfflineOwnerIds(): Promise<string[]> {
    const [collections, snippets, collectionUpdates, snippetUpdates] = await Promise.all([
        offlineSnippetlyDb.pendingCollectionCreations.toArray(),
        offlineSnippetlyDb.pendingSnippetCreations.toArray(),
        offlineSnippetlyDb.pendingCollectionUpdates.toArray(),
        offlineSnippetlyDb.pendingSnippetUpdates.toArray(),
    ]);
    return [
        ...new Set(
            [...collections, ...snippets, ...collectionUpdates, ...snippetUpdates].map(item => item.ownerId),
        ),
    ];
}

export function isOfflineMutationAvailable(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine && !!getOfflineOwnerId();
}

export function isOfflineCreationRoute(pathname: string): boolean {
    const normalizedPath = pathname.replace(/\/+$/, '');
    return (
        isOfflineMutationAvailable() &&
        (normalizedPath === '/dashboard/snippets/new' || normalizedPath === '/dashboard/collections/new')
    );
}

export function isOfflineDashboardAvailable(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine && !!getOfflineOwnerId();
}

export function isOfflineDashboardRoute(pathname: string): boolean {
    if (!isOfflineDashboardAvailable()) return false;
    const normalizedPath = pathname.replace(/\/+$/, '') || '/dashboard';
    return (
        [
            '/dashboard',
            '/dashboard/snippets',
            '/dashboard/collections',
            '/dashboard/favourites',
            '/dashboard/snippets/new',
            '/dashboard/collections/new',
        ].includes(normalizedPath) ||
        /^\/dashboard\/(?:snippets|collections)\/[^/]+\/edit$/.test(normalizedPath)
    );
}
