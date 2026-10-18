import { fetchAndCacheDashboardData } from '@/features/offline-snippet/lib/offline-dashboard-cache';
import { getOfflineOwnerId } from '@/features/offline-snippet/lib/store';
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
        queryKey: ['favourites', 'snippets', getOfflineOwnerId(), ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({ ...input, take, skip: pageParam });
            const url = apiEndpoints.favourites.snippets.url(searchParams);
            return fetchAndCacheDashboardData('favourite-snippets', url, () =>
                developerApiClient.fetch<FavouriteSnippetsListDtoType['output']>(url, {
                    method: apiEndpoints.favourites.snippets.method,
                }),
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
        queryKey: ['favourites', 'collections', getOfflineOwnerId(), ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({ ...input, take, skip: pageParam });
            const url = apiEndpoints.favourites.collections.url(searchParams);
            return fetchAndCacheDashboardData('favourite-collections', url, () =>
                developerApiClient.fetch<FavouriteCollectionsListDtoType['output']>(url, {
                    method: apiEndpoints.favourites.collections.method,
                }),
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
        queryKey: ['favourites', 'developers', getOfflineOwnerId(), ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({ ...input, take, skip: pageParam });
            const url = apiEndpoints.favourites.developers.url(searchParams);
            return developerApiClient.fetch<FavouriteDevelopersListDtoType['output']>(url, {
                method: apiEndpoints.favourites.developers.method,
            });
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};
