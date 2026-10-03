import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { DEFAULT_LISTING_COUNT } from '@/lib/constants';
import type { CollectionListDtoType, CurrentUserCollectionListDtoType } from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const listCurrentUserCollectionsQueryOptions = (
    input: CurrentUserCollectionListDtoType['input'] = {},
    queryKey?: string[],
) => {
    const take = typeof input.take === 'number' ? input.take : DEFAULT_LISTING_COUNT;
    const initialSkip = typeof input.skip === 'number' ? input.skip : 0;

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
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            const nextSkip = lastPageParam + lastPage.items.length;
            return lastPage.items.length > 0 && nextSkip < lastPage.itemsCount ? nextSkip : undefined;
        },
    });
};

export const listCreatorCollectionsQueryOption = (
    creatorId: string,
    input: Omit<CollectionListDtoType['input'], 'creator'> = {},
    queryKey?: string[],
) => {
    const take = typeof input.take === 'number' ? input.take : DEFAULT_LISTING_COUNT;
    const initialSkip = typeof input.skip === 'number' ? input.skip : 0;

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
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            const nextSkip = lastPageParam + lastPage.items.length;
            return lastPage.items.length > 0 && nextSkip < lastPage.itemsCount ? nextSkip : undefined;
        },
    });
};
