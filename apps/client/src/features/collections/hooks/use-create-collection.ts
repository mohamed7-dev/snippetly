import { api } from '@/lib/api-client';
import { serverEndpoints } from '@/lib/routes';
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types';
import { useMutation, type MutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateCollectionSchema } from '../lib/schema';
import type { Collection } from '../lib/types';

type Input = Omit<CreateCollectionSchema, 'isPublic'> & { isPrivate: boolean };
type CreateCollectionSuccessRes = SharedSuccessRes<Omit<Collection, 'isForked' | 'lastUpdatedAt'>>;
type CreateCollectionErrorRes = AxiosError<ErrorResponse>;

export function useCreateCollection(
    options?: Omit<
        MutationOptions<CreateCollectionSuccessRes, CreateCollectionErrorRes, Input>,
        'MutationFn'
    >,
) {
    return useMutation({
        mutationFn: async input => {
            const res = await api.post<CreateCollectionSuccessRes>(serverEndpoints.createCollection, input);
            return res.data;
        },
        ...options,
    });
}
