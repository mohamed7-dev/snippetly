import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { DEFAULT_LISTING_COUNT } from '@/lib/constants';
import type { SnippetListDtoType } from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { infiniteQueryOptions } from '@tanstack/react-query';

export const listCreatorSnippetsQueryOptions = (
    creatorId: string,
    input: Omit<SnippetListDtoType['input'], 'creator'> = {},
    queryKey?: string[],
) => {
    const take = typeof input.take === 'number' ? input.take : DEFAULT_LISTING_COUNT;
    const initialSkip = typeof input.skip === 'number' ? input.skip : 0;

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
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            const nextSkip = lastPageParam + lastPage.items.length;
            return lastPage.items.length > 0 && nextSkip < lastPage.itemsCount ? nextSkip : undefined;
        },
    });
};

export const listCollectionSnippetsQueryOptions = (
    collectionId: string,
    input: Omit<SnippetListDtoType['input'], 'collection'> = {},
    queryKey?: string[],
) => {
    const take = typeof input.take === 'number' ? input.take : DEFAULT_LISTING_COUNT;
    const initialSkip = typeof input.skip === 'number' ? input.skip : 0;

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
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            const nextSkip = lastPageParam + lastPage.items.length;
            return lastPage.items.length > 0 && nextSkip < lastPage.itemsCount ? nextSkip : undefined;
        },
    });
};
