import { api } from '@/lib/api-client';
import { serverEndpoints } from '@/lib/routes';
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types';
import { useMutation, useMutationState, useQueryClient, type MutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { UpdateCollectionSchema } from '../lib/schema';
import type { Collection } from '../lib/types';

type Input = {
    slug: string;
    data: Omit<UpdateCollectionSchema, 'isPublic'> & { isPrivate: boolean };
};
type UpdateCollectionSuccessRes = SharedSuccessRes<Collection>;
type UpdateCollectionErrorRes = AxiosError<ErrorResponse | { newSlug: string }>;

export function useUpdateCollection(
    options?: Omit<
        MutationOptions<UpdateCollectionSuccessRes, UpdateCollectionErrorRes, Input>,
        'mutationFn' | 'mutationKey'
    >,
) {
    const qClient = useQueryClient();
    return useMutation({
        ...options,
        mutationKey: ['update-snippet'],
        mutationFn: async ({ slug, data }) => {
            const res = await api.put(serverEndpoints.updateCollection(slug), data);
            return res.data;
        },
        onSuccess: (data, variables, ctx) => {
            qClient.invalidateQueries({
                queryKey: ['collections', variables.slug],
            });
            options?.onSuccess?.(data, variables, ctx);
        },
    });
}

export function useGetUpdateCollectionMutationState() {
    return useMutationState({
        filters: { mutationKey: ['update-snippet'] },
        select: mutation => mutation.state,
    });
}
