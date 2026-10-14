import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { createSkipPagination } from '@/lib/skip-pagination';
import type {
    CurrentUserTrashedCollectionListDtoType,
    CurrentUserTrashedSnippetListDtoType,
} from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const listTrashedSnippetsQueryOptions = (
    input: CurrentUserTrashedSnippetListDtoType['input'] = {},
    queryKeys?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['snippets', 'trash', ...(queryKeys ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
            });
            return developerApiClient.fetch<CurrentUserTrashedSnippetListDtoType['output']>(
                apiEndpoints.snippets.listTrash.url(searchParams),
                { method: apiEndpoints.snippets.listTrash.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};

export const listTrashedCollectionsQueryOptions = (
    input: CurrentUserTrashedCollectionListDtoType['input'] = {},
    queryKeys?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['trash', 'collections', ...(queryKeys ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
            });
            return developerApiClient.fetch<CurrentUserTrashedCollectionListDtoType['output']>(
                apiEndpoints.collections.listTrash.url(searchParams),
                { method: apiEndpoints.collections.listTrash.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};
