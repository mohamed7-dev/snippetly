export const OFFLINE_CREATION_SYNC_TAG = 'snippetly-offline-creations';
export const OFFLINE_CREATION_SYNC_REQUEST = 'offline-creation-sync-request';

type SyncManagerRegistration = ServiceWorkerRegistration & {
    sync?: {
        register: (tag: string) => Promise<void>;
    };
};

export async function registerOfflineCreationSync(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false;

    const registration = (await navigator.serviceWorker.ready) as SyncManagerRegistration;
    if (!registration.sync) return false;

    await registration.sync.register(OFFLINE_CREATION_SYNC_TAG);
    return true;
}

export async function requestOfflineCreationSync(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await navigator.serviceWorker.ready;
    const worker = registration.active ?? navigator.serviceWorker.controller;
    if (!worker) return false;

    worker.postMessage({ type: OFFLINE_CREATION_SYNC_REQUEST });
    return true;
}
