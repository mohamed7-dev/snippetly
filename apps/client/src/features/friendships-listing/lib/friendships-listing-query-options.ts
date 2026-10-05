import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { createSkipPagination } from '@/lib/skip-pagination';
import type {
    CurrentUserFriendsListDtoType,
    CurrentUserInboxListDtoType,
    CurrentUserOutboxListDtoType,
} from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const listCurrentUserInboxQueryOptions = (
    input: CurrentUserInboxListDtoType['input'] = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['friendships', 'current', 'inbox', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
            });
            return await developerApiClient.fetch<CurrentUserInboxListDtoType['output']>(
                apiEndpoints.friendships.listCurrentUserInbox.url(searchParams),
                { method: apiEndpoints.friendships.listCurrentUserInbox.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};

export const listCurrentUserOutboxQueryOptions = (
    input: CurrentUserOutboxListDtoType['input'] = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['friendships', 'current', 'outbox', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
            });
            return await developerApiClient.fetch<CurrentUserOutboxListDtoType['output']>(
                apiEndpoints.friendships.listCurrentUserOutbox.url(searchParams),
                { method: apiEndpoints.friendships.listCurrentUserOutbox.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};

export const listCurrentUserFriendsQueryOptions = (
    input: CurrentUserFriendsListDtoType['input'] = {},
    queryKey?: string[],
) => {
    const { initialSkip, getNextPageParam, take } = createSkipPagination(input.skip, input.take);

    return infiniteQueryOptions({
        queryKey: ['friendships', 'current', 'friends', ...(queryKey ?? [])],
        queryFn: async ({ pageParam }) => {
            const searchParams = transformInputToSearchParams({
                ...input,
                take,
                skip: pageParam,
            });
            return await developerApiClient.fetch<CurrentUserFriendsListDtoType['output']>(
                apiEndpoints.friendships.listCurrentUserFriends.url(searchParams),
                { method: apiEndpoints.friendships.listCurrentUserFriends.method },
            );
        },
        initialPageParam: initialSkip,
        getNextPageParam,
    });
};
