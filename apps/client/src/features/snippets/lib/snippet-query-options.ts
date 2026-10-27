import { fetchAndCacheDashboardData } from '@/features/offline-snippet/lib/offline-dashboard-cache';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import type { FindOneSnippetDtoType, RelatedSnippetsDtoType } from '@snippetly/common/dto';
import { queryOptions } from '@tanstack/react-query';

export const getSnippetQueryOptions = (snippetId: string) =>
    queryOptions({
        queryKey: ['snippets', snippetId],
        queryFn: async () => {
            const url = apiEndpoints.snippets.findOne.url(snippetId);
            return fetchAndCacheDashboardData('snippet-details', snippetId, () =>
                developerApiClient.fetch<FindOneSnippetDtoType['output']>(url, {
                    method: apiEndpoints.snippets.findOne.method,
                }),
            );
        },
    });

export const getRelatedSnippetsQueryOptions = (snippetId: string) =>
    queryOptions({
        queryKey: ['snippets', snippetId, 'related'],
        queryFn: async () =>
            developerApiClient.fetch<RelatedSnippetsDtoType['output']>(
                apiEndpoints.snippets.related.url(snippetId),
                { method: apiEndpoints.snippets.related.method },
            ),
    });
