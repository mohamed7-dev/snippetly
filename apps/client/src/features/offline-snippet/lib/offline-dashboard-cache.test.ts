import { OfflineDataUnavailableError, OfflineNetworkError } from '@/lib/api-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const storeMocks = vi.hoisted(() => ({
    cache: vi.fn(),
    get: vi.fn(),
    getOwnerId: vi.fn(),
}));

vi.mock('./offline-dashboard-storage', () => ({
    cacheOfflineDashboardData: storeMocks.cache,
    getOfflineDashboardData: storeMocks.get,
}));
vi.mock('./offline-collection-storage', () => ({
    getOfflineOwnerId: storeMocks.getOwnerId,
}));

import { fetchAndCacheDashboardData } from './offline-dashboard-cache';

describe('fetchAndCacheDashboardData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        storeMocks.getOwnerId.mockReturnValue('owner');
    });

    it('stores successful current-user dashboard responses', async () => {
        const response = { items: [{ id: 'snippet' }] };

        await expect(
            fetchAndCacheDashboardData('snippets', '/snippets/me', async () => response),
        ).resolves.toEqual(response);

        expect(storeMocks.cache).toHaveBeenCalledWith('owner', 'snippets', '/snippets/me', response);
    });

    it('returns the owner-scoped cached response when a request fails offline', async () => {
        const response = { items: [{ id: 'cached-snippet' }] };
        storeMocks.get.mockResolvedValue(response);

        await expect(
            fetchAndCacheDashboardData('snippets', '/snippets/me', async () => {
                throw new OfflineNetworkError();
            }),
        ).resolves.toEqual(response);
        expect(storeMocks.get).toHaveBeenCalledWith('owner', 'snippets', '/snippets/me');
    });

    it('throws a clear offline error if the requested dashboard response was never cached', async () => {
        storeMocks.get.mockResolvedValue(undefined);

        await expect(
            fetchAndCacheDashboardData('favourite-snippets', '/favourites/snippets', async () => {
                throw new OfflineNetworkError();
            }),
        ).rejects.toBeInstanceOf(OfflineDataUnavailableError);
    });

    it('caches viewed entity details under the entity owner when auth initialization has not stored an owner yet', async () => {
        storeMocks.getOwnerId.mockReturnValue(undefined);
        const response = { id: 'collection-id', creator: { id: 'owner' } };

        await expect(
            fetchAndCacheDashboardData('collection-details', 'collection-id', async () => response),
        ).resolves.toEqual(response);

        expect(storeMocks.cache).toHaveBeenCalledWith(
            'owner',
            'collection-details',
            'collection-id',
            response,
        );
    });

    it('reads a cached entity using the owner marker available when the offline request fails', async () => {
        storeMocks.getOwnerId.mockReturnValue(undefined);
        const response = { id: 'snippet-id' };
        storeMocks.get.mockResolvedValue(response);

        await expect(
            fetchAndCacheDashboardData('snippet-details', 'snippet-id', async () => {
                storeMocks.getOwnerId.mockReturnValue('owner');
                throw new OfflineNetworkError();
            }),
        ).resolves.toEqual(response);
        expect(storeMocks.get).toHaveBeenCalledWith('owner', 'snippet-details', 'snippet-id');
    });
});
