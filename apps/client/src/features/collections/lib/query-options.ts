import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import type { FindOneCollectionDtoType } from '@snippetly/common/dto';
import { queryOptions } from '@tanstack/react-query';

export const getCollectionQueryOptions = (collectionId: string) =>
    queryOptions({
        queryKey: ['collections', collectionId],
        queryFn: async () => {
            return developerApiClient.fetch<FindOneCollectionDtoType['output']>(
                apiEndpoints.collections.findOne.url(collectionId),
                { method: apiEndpoints.collections.findOne.method },
            );
        },
    });
