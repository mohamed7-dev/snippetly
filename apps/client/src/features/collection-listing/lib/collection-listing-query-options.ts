import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { createSkipPagination } from '@/lib/skip-pagination';
import type { CollectionListDtoType, CurrentUserCollectionListDtoType } from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const listCurrentUserCollectionsQueryOptions = (
    input: CurrentUserCollectionListDtoType['input'] = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['collections', 'current', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
            });
            return await developerApiClient.fetch<CurrentUserCollectionListDtoType['output']>(
                apiEndpoints.collections.listMine.url(searchParams),
                { method: apiEndpoints.collections.listMine.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};

export const listCreatorCollectionsQueryOption = (
    creatorId: string,
    input: Omit<CollectionListDtoType['input'], 'creator'> = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['collections', 'creator', creatorId, ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
                creator: creatorId,
            });
            return developerApiClient.fetch<CollectionListDtoType['output']>(
                apiEndpoints.collections.list.url(searchParams),
                { method: apiEndpoints.collections.list.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};
