import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { createSkipPagination } from '@/lib/skip-pagination';
import type {
    FavouriteCollectionsListDtoType,
    FavouriteDevelopersListDtoType,
    FavouriteSnippetsListDtoType,
} from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const favouriteSnippetsQueryOptions = (
    input: FavouriteSnippetsListDtoType['input'] = {},
    queryKey?: unknown[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['favourites', 'snippets', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({ ...input, take, skip: pageParam });
            return developerApiClient.fetch<FavouriteSnippetsListDtoType['output']>(
                apiEndpoints.favourites.snippets.url(searchParams),
                { method: apiEndpoints.favourites.snippets.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};

export const favouriteCollectionsQueryOptions = (
    input: FavouriteCollectionsListDtoType['input'] = {},
    queryKey?: unknown[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['favourites', 'collections', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({ ...input, take, skip: pageParam });
            return developerApiClient.fetch<FavouriteCollectionsListDtoType['output']>(
                apiEndpoints.favourites.collections.url(searchParams),
                { method: apiEndpoints.favourites.collections.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};

export const favouriteDevelopersQueryOptions = (
    input: FavouriteDevelopersListDtoType['input'] = {},
    queryKey?: unknown[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['favourites', 'developers', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({ ...input, take, skip: pageParam });
            return developerApiClient.fetch<FavouriteDevelopersListDtoType['output']>(
                apiEndpoints.favourites.developers.url(searchParams),
                { method: apiEndpoints.favourites.developers.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};
