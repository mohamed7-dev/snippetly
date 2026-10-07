import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import type { ActiveDeveloperAccountStatsDtoType } from '@snippetly/common/dto';
import { queryOptions } from '@tanstack/react-query';

export const getCurrentDeveloperActivityStats = () =>
    queryOptions({
        queryKey: ['stats', 'current'],
        queryFn: async () => {
            return await developerApiClient.fetch<ActiveDeveloperAccountStatsDtoType['output']>(
                apiEndpoints.developers.getActiveDeveloperStats.url,
                { method: apiEndpoints.developers.getActiveDeveloperStats.method },
            );
        },
    });
