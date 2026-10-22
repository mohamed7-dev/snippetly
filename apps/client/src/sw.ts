/// <reference lib="webworker" />

import type { ActiveDeveloperDtoType } from '@snippetly/common/dto';
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import {
    OFFLINE_CREATION_SYNC_REQUEST,
    OFFLINE_CREATION_SYNC_TAG,
} from './features/offline-snippet/lib/register-background-sync';
import {
    getOfflineSyncCredential,
    listPendingOfflineCreationOwnerIds,
    saveOfflineSyncCredential,
} from './features/offline-snippet/lib/store';
import { syncPendingCreations } from './features/offline-snippet/lib/sync-pending-creations';
import { developerApiClient } from './lib/api-client';
import { apiEndpoints } from './lib/api-endpoints';

declare let self: ServiceWorkerGlobalScope & {
    __WB_MANIFEST: Array<{ url: string; revision?: string | null }>;
};

type BackgroundSyncEvent = ExtendableEvent & { tag: string };
type SyncCapableWorker = ServiceWorkerGlobalScope & {
    addEventListener(type: 'sync', listener: (event: BackgroundSyncEvent) => void): void;
};

const worker = self as SyncCapableWorker;

precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
    let payload: { title?: string; body?: string; url?: string; tag?: string } = {};
    try {
        payload = event.data?.json() ?? {};
    } catch {
        payload = {};
    }

    const title = payload.title || 'Snippetly';
    const body = payload.body || 'There is something new to explore.';
    const url = getSafePushUrl(payload.url);

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: '/web-app-manifest-192x192.png',
            badge: '/web-app-manifest-192x192.png',
            tag: payload.tag,
            data: { url },
        }),
    );
});

function getSafePushUrl(value?: string): string {
    try {
        const destination = new URL(value || '/', self.location.origin);
        return destination.origin === self.location.origin
            ? destination.pathname + destination.search + destination.hash
            : '/';
    } catch {
        return '/';
    }
}

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const destination = new URL(
        typeof event.notification.data?.url === 'string' ? event.notification.data.url : '/',
        self.location.origin,
    );
    const url = destination.origin === self.location.origin ? destination.href : self.location.origin;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            const existingClient = clients.find(client => client.url.startsWith(self.location.origin));
            if (existingClient) {
                return existingClient.navigate(url).then(client => client?.focus());
            }
            return self.clients.openWindow(url);
        }),
    );
});

async function syncOfflineCreations() {
    const ownerIds = await listPendingOfflineCreationOwnerIds();
    for (const ownerId of ownerIds) {
        const credentials = await getOfflineSyncCredential(ownerId);
        if (!credentials) continue;

        let token = credentials.token;
        const activeDeveloper = await developerApiClient.fetchWithToken<ActiveDeveloperDtoType['output']>(
            apiEndpoints.developers.getActiveDeveloper.url,
            { method: apiEndpoints.developers.getActiveDeveloper.method },
            token,
            refreshedToken => {
                token = refreshedToken;
                return updateCredential(ownerId, refreshedToken);
            },
        );

        if (!activeDeveloper || activeDeveloper.id !== ownerId) {
            await notifyClients({
                type: 'offline-creation-sync-auth-mismatch',
                ownerId,
            });
            continue;
        }

        const result = await syncPendingCreations(ownerId, token, refreshedToken =>
            updateCredential(ownerId, refreshedToken),
        );
        await notifyClients({
            type: 'offline-creation-sync-complete',
            ownerId,
            collections: result.collections,
            snippets: result.snippets,
            hasPending: result.hasPending,
        });
        if (result.retryableFailure) {
            throw new Error('Offline creation sync had a retryable failure.');
        }
    }
}

worker.addEventListener('sync', event => {
    if (event.tag !== OFFLINE_CREATION_SYNC_TAG) return;
    event.waitUntil(syncOfflineCreations());
});

type SyncRequestMessageEvent = ExtendableMessageEvent;
self.addEventListener('message', (event: SyncRequestMessageEvent) => {
    if (
        typeof event.data !== 'object' ||
        event.data === null ||
        !('type' in event.data) ||
        event.data.type !== OFFLINE_CREATION_SYNC_REQUEST
    ) {
        return;
    }
    event.waitUntil(syncOfflineCreations());
});

async function updateCredential(ownerId: string, token: string) {
    await saveOfflineSyncCredential(ownerId, token);
}

async function notifyClients(message: Record<string, unknown>) {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) client.postMessage(message);
}
