import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import type { FindOneSnippetDtoType } from '@snippetly/common/dto';
import { queryOptions } from '@tanstack/react-query';

export const getSnippetQueryOptions = (snippetId: string) =>
    queryOptions({
        queryKey: ['snippets', snippetId],
        queryFn: async () => {
            return await developerApiClient.fetch<FindOneSnippetDtoType['output']>(
                apiEndpoints.snippets.findOne.url(snippetId),
                { method: apiEndpoints.snippets.findOne.method },
            );
        },
    });
