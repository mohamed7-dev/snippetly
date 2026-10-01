import { api } from '@/lib/api-client';
import { serverEndpoints } from '@/lib/routes';
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types';
import { useMutation, useQueryClient, type MutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type Input = {
    slug: string;
};
export type DeleteCollectionSuccessRes = SharedSuccessRes<null>;
export type DeleteCollectionErrorRes = AxiosError<ErrorResponse>;

export function useDeleteCollection(
    options?: Omit<
        MutationOptions<DeleteCollectionSuccessRes, DeleteCollectionErrorRes, Input>,
        'mutationFn' | 'mutationKey'
    >,
) {
    const qClient = useQueryClient();
    return useMutation({
        ...options,
        mutationFn: async ({ slug }) => {
            const res = await api.delete<DeleteCollectionSuccessRes>(serverEndpoints.deleteCollection(slug));
            return res.data;
        },
        onSuccess: (data, variables, ctx) => {
            qClient.removeQueries({ queryKey: ['collections', variables.slug] });
            qClient.invalidateQueries({ queryKey: ['collections', 'current'] });
            options?.onSuccess?.(data, variables, ctx);
        },
    });
}
