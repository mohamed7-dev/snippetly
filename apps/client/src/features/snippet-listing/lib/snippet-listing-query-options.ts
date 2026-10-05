import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { createSkipPagination } from '@/lib/skip-pagination';
import type {
    CurrentUserSnippetListDtoType,
    SnippetListDtoType,
    UserFriendsSnippetsListDtoType,
} from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const listCreatorSnippetsQueryOptions = (
    creatorId: string,
    input: Omit<SnippetListDtoType['input'], 'creator'> = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['snippets', 'creator', creatorId, ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
                creator: creatorId,
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

export const listCollectionSnippetsQueryOptions = (
    collectionId: string,
    input: Omit<SnippetListDtoType['input'], 'collection'> = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['snippets', 'collection', collectionId, ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                collection: collectionId,
                take,
                skip: pageParam,
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

export const listCurrentUserSnippetsQueryOptions = (
    input: CurrentUserSnippetListDtoType['input'] = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['snippets', 'current', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
            });
            return await developerApiClient.fetch<CurrentUserSnippetListDtoType['output']>(
                apiEndpoints.snippets.listMine.url(searchParams),
                { method: apiEndpoints.snippets.listMine.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};

export const listCurrentUserFriendsSnippetsQueryOptions = (
    input: Omit<UserFriendsSnippetsListDtoType['input'], 'creator'> = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['snippets', 'current', 'friends', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
            });
            return await developerApiClient.fetch<UserFriendsSnippetsListDtoType['output']>(
                apiEndpoints.snippets.listFriends.url(searchParams),
                { method: apiEndpoints.snippets.listFriends.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};
