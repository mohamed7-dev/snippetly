import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import type { ListActiveSessionsDtoType } from '@snippetly/common/dto';
import { queryOptions } from '@tanstack/react-query';

export const activeSessionsQueryOptions = () =>
    queryOptions({
        queryKey: ['auth', 'sessions'],
        queryFn: async () =>
            developerApiClient.fetch<ListActiveSessionsDtoType['output']>(
                apiEndpoints.auth.listSessions.url,
                { method: apiEndpoints.auth.listSessions.method },
            ),
    });
