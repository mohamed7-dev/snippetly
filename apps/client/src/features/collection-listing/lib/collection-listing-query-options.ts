import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import {
    cacheOfflineCollectionOptions,
    getOfflineOwnerId,
} from '@/features/offline-snippet/lib/store';
import { fetchAndCacheDashboardData } from '@/features/offline-snippet/lib/offline-dashboard-cache';
import { toast } from 'sonner';
import { createSkipPagination } from '@/lib/skip-pagination';
import type { CollectionListDtoType, CurrentUserCollectionListDtoType } from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const listCurrentUserCollectionsQueryOptions = (
    input: CurrentUserCollectionListDtoType['input'] = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['collections', 'current', getOfflineOwnerId(), ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
            });
            const url = apiEndpoints.collections.listMine.url(searchParams);
            const result = await fetchAndCacheDashboardData(
                'collections',
                url,
                () =>
                    developerApiClient.fetch<CurrentUserCollectionListDtoType['output']>(url, {
                        method: apiEndpoints.collections.listMine.method,
                    }),
            );
            const ownerId = getOfflineOwnerId() ?? result.items[0]?.creator.id;
            if (ownerId) {
                try {
                    await cacheOfflineCollectionOptions(
                        result.items.map(collection => ({
                            id: collection.id,
                            name: collection.name,
                            color: collection.color,
                            ownerId,
                        })),
                    );
                } catch (error) {
                    console.error('Could not cache collections for offline use.', error);
                    toast.error('Collections could not be saved for offline use.');
                }
            }
            return result;
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};

export const listCreatorCollectionsQueryOption = (
    creatorId: string,
    input: Omit<CollectionListDtoType['input'], 'creator'> = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['collections', 'creator', creatorId, ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
                creator: creatorId,
            });
            return developerApiClient.fetch<CollectionListDtoType['output']>(
                apiEndpoints.collections.list.url(searchParams),
                { method: apiEndpoints.collections.list.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};
