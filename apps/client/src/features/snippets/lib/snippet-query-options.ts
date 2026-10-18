import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { fetchAndCacheDashboardData } from '@/features/offline-snippet/lib/offline-dashboard-cache';
import type { FindOneSnippetDtoType } from '@snippetly/common/dto';
import { queryOptions } from '@tanstack/react-query';

export const getSnippetQueryOptions = (snippetId: string) =>
    queryOptions({
        queryKey: ['snippets', snippetId],
        queryFn: async () => {
            const url = apiEndpoints.snippets.findOne.url(snippetId);
            return fetchAndCacheDashboardData(
                'snippet-details',
                snippetId,
                () =>
                    developerApiClient.fetch<FindOneSnippetDtoType['output']>(url, {
                        method: apiEndpoints.snippets.findOne.method,
                    }),
            );
        },
    });
