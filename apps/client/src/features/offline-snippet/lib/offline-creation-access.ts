import { LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY } from '@/lib/constants';

export function getOfflineCreationOwnerId(): string | undefined {
    if (typeof localStorage === 'undefined') return undefined;
    return localStorage.getItem(LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY) ?? undefined;
}

export function isOfflineCreationAvailable(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine && !!getOfflineCreationOwnerId();
}

export function isOfflineDashboardAvailable(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine && !!getOfflineCreationOwnerId();
}

export function isOfflineCreationRoute(pathname: string): boolean {
    const normalizedPath = pathname.replace(/\/+$/, '');
    return (
        isOfflineCreationAvailable() &&
        (normalizedPath === '/dashboard/snippets/new' || normalizedPath === '/dashboard/collections/new')
    );
}

export function isOfflineDashboardRoute(pathname: string): boolean {
    if (!isOfflineDashboardAvailable()) return false;
    const normalizedPath = pathname.replace(/\/+$/, '') || '/dashboard';
    return [
        '/dashboard',
        '/dashboard/snippets',
        '/dashboard/collections',
        '/dashboard/favourites',
        '/dashboard/snippets/new',
        '/dashboard/collections/new',
    ].includes(normalizedPath) || /^\/dashboard\/(?:snippets|collections)\/[^/]+\/edit$/.test(normalizedPath);
}
