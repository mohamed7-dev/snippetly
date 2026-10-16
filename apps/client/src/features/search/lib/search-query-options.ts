import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import type { SearchDtoType } from '@snippetly/common/dto';
import { infiniteQueryOptions } from '@tanstack/react-query';

const SEARCH_PAGE_SIZE = 25;

type SearchQueryInput = {
    term?: string;
    tags?: string[];
};

export const searchQueryOptions = ({ term, tags }: SearchQueryInput) =>
    infiniteQueryOptions({
        queryKey: ['search', term ?? '', tags ?? []],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                term,
                tags: tags?.length ? { values: tags } : undefined,
                take: SEARCH_PAGE_SIZE,
                skip: pageParam,
            });
            return await developerApiClient.fetch<SearchDtoType['output']>(
                apiEndpoints.search.query.url(searchParams),
                { method: apiEndpoints.search.query.method },
            );
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const nextSkip = allPages.length * SEARCH_PAGE_SIZE;
            const groups = [lastPage.snippets, lastPage.collections, lastPage.developers];

            return groups.some(group => group.totalItems > nextSkip) ? nextSkip : undefined;
        },
        enabled: Boolean(term || tags?.length),
    });
