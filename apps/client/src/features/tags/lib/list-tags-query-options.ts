import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import type { PopularTagsDtoType } from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { queryOptions } from '@tanstack/react-query';

export function listPopularTagsQueryOptions(input: PopularTagsDtoType['input'] = {}, queryKeys?: string[]) {
    return queryOptions({
        queryKey: ['tags', 'popular', ...(queryKeys ?? [])],
        queryFn: async () => {
            return await developerApiClient.fetch<PopularTagsDtoType['output']>(
                apiEndpoints.tags.popularList.url(transformInputToSearchParams(input)),
            );
        },
    });
}
