import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import type { ApiClientError } from '@/lib/api-client';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { SuccessResponse } from '@snippetly/common/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export type FavouriteResourceType = 'snippets' | 'collections' | 'developers';

export type AddToFavouritesMutationCallbacks = AsyncActionCallback<SuccessResponse, ApiClientError>;

export function useAddToFavourites(callbacks?: AddToFavouritesMutationCallbacks) {
    const qClient = useQueryClient();
    return useMutation({
        mutationFn: ({ resourceType, id }: { resourceType: FavouriteResourceType; id: string }) =>
            developerApiClient.fetch<{ success: boolean }>(
                apiEndpoints.favourites.add.url(resourceType, id),
                { method: apiEndpoints.favourites.add.method },
            ),
        ...callbacks,
        onSuccess: async data => {
            toast.success('Added to favourites');
            qClient.invalidateQueries(getCurrentDeveloperActivityStats());
            callbacks?.onSuccess?.(data);
        },
        onError: error => {
            toastApiError(error as ApiClientError);
            callbacks?.onError?.(error as ApiClientError);
        },
    });
}

export type RemoveFromFavouritesMutationCallbacks = AsyncActionCallback<SuccessResponse, ApiClientError>;

export function useRemoveFromFavourites(callbacks?: RemoveFromFavouritesMutationCallbacks) {
    const qClient = useQueryClient();

    return useMutation({
        mutationFn: ({ resourceType, id }: { resourceType: FavouriteResourceType; id: string }) =>
            developerApiClient.fetch<{ success: boolean }>(
                apiEndpoints.favourites.remove.url(resourceType, id),
                { method: apiEndpoints.favourites.remove.method },
            ),
        ...callbacks,
        onSuccess: async data => {
            toast.success('Removed from favourites');
            qClient.invalidateQueries(getCurrentDeveloperActivityStats());

            callbacks?.onSuccess?.(data);
        },
        onError: error => {
            toastApiError(error as ApiClientError);
            callbacks?.onError?.(error as ApiClientError);
        },
    });
}
