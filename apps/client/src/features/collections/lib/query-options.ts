import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { fetchAndCacheDashboardData } from '@/features/offline-snippet/lib/offline-dashboard-cache';
import type { FindOneCollectionDtoType } from '@snippetly/common/dto';
import { queryOptions } from '@tanstack/react-query';

export const getCollectionQueryOptions = (collectionId: string) =>
    queryOptions({
        queryKey: ['collections', collectionId],
        queryFn: async () => {
            const url = apiEndpoints.collections.findOne.url(collectionId);
            return fetchAndCacheDashboardData(
                'collection-details',
                collectionId,
                () =>
                    developerApiClient.fetch<FindOneCollectionDtoType['output']>(url, {
                        method: apiEndpoints.collections.findOne.method,
                    }),
            );
        },
    });
