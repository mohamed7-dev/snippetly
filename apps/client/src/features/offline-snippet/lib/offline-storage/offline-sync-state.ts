/**
 * @description
 * Stores service-worker sync credentials and leases used to coordinate offline synchronization.
 */
import { offlineSnippetlyDb } from './offline-database';
import type { OfflineSyncCredential } from './store-types';

/**
 * @description Stores a sync credential for the specified owner.
 */
export async function saveOfflineSyncCredential(ownerId: string, token: string): Promise<void> {
    await offlineSnippetlyDb.syncCredentials.put({ ownerId, token, updatedAt: new Date() });
}

/**
 * @description Retrieves the sync credential for an owner, if one is stored.
 */
export async function getOfflineSyncCredential(ownerId: string): Promise<OfflineSyncCredential | undefined> {
    return offlineSnippetlyDb.syncCredentials.get(ownerId);
}

/**
 * @description
 * Removes an owner's stored sync credential.
 */
export async function removeOfflineSyncCredential(ownerId: string): Promise<void> {
    await offlineSnippetlyDb.syncCredentials.delete(ownerId);
}

/**
 * @description
 * Acquires an owner-specific sync lease unless a different unexpired lease already exists.
 */
export async function acquireOfflineSyncLease(
    ownerId: string,
    leaseId: string,
    durationMs: number,
): Promise<boolean> {
    return offlineSnippetlyDb.transaction('rw', offlineSnippetlyDb.syncLeases, async () => {
        const existingLease = await offlineSnippetlyDb.syncLeases.get(ownerId);
        if (existingLease && existingLease.expiresAt > Date.now()) return false;

        await offlineSnippetlyDb.syncLeases.put({
            ownerId,
            leaseId,
            expiresAt: Date.now() + durationMs,
        });
        return true;
    });
}

/**
 * @description
 * Releases an owner's lease only when the caller still holds that lease.
 */
export async function releaseOfflineSyncLease(ownerId: string, leaseId: string): Promise<void> {
    await offlineSnippetlyDb.transaction('rw', offlineSnippetlyDb.syncLeases, async () => {
        const existingLease = await offlineSnippetlyDb.syncLeases.get(ownerId);
        if (existingLease?.leaseId === leaseId) {
            await offlineSnippetlyDb.syncLeases.delete(ownerId);
        }
    });
}
