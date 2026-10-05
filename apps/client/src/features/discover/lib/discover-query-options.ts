import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { createSkipPagination } from '@/lib/skip-pagination';
import type { CollectionListDtoType, DeveloperListDtoType, SnippetListDtoType } from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const discoverDevelopersQueryOptions = (
    input: DeveloperListDtoType['input'] = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['discover', 'developers', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
                discover: true,
            });
            return await developerApiClient.fetch<DeveloperListDtoType['output']>(
                apiEndpoints.developers.list.url(searchParams),
                { method: apiEndpoints.developers.list.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};

export const discoverSnippetsQueryOptions = (
    input: SnippetListDtoType['input'] = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['discover', 'snippets', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
                discover: true,
            });
            return await developerApiClient.fetch<SnippetListDtoType['output']>(
                apiEndpoints.snippets.list.url(searchParams),
                { method: apiEndpoints.snippets.list.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};

export const discoverCollectionsQueryOptions = (
    input: CollectionListDtoType['input'] = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['discover', 'collections', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
                discover: true,
            });
            return await developerApiClient.fetch<CollectionListDtoType['output']>(
                apiEndpoints.collections.list.url(searchParams),
                { method: apiEndpoints.collections.list.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};
