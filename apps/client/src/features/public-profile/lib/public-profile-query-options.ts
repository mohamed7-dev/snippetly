import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import type { FindOneDeveloperDtoType } from '@snippetly/common/dto';
import { queryOptions } from '@tanstack/react-query';

export const getDeveloperProfileQueryOptions = (id: string) =>
    queryOptions({
        queryKey: ['users', 'profiles', id],
        queryFn: async () => {
            return await developerApiClient.fetch<FindOneDeveloperDtoType['output']>(
                apiEndpoints.developers.findOne.url(id),
                { method: apiEndpoints.developers.findOne.method },
            );
        },
    });
