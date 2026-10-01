import { api } from '@/lib/api-client';
import { serverEndpoints } from '@/lib/routes';
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types';
import { useMutation, useMutationState, type MutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateSnippetSchema } from '../lib/schema';
import type { Snippet } from '../lib/types';

type Input = Omit<CreateSnippetSchema, 'isPublic'> & { isPrivate: boolean };
type CreateSnippetSuccessRes = SharedSuccessRes<
    Omit<Snippet, 'lastUpdatedAt' | 'isForked'> & {
        collectionPublicId: string;
        creatorName: string;
    }
>;
type CreateSnippetErrorRes = AxiosError<ErrorResponse>;

export function useCreateSnippet(
    options?: Omit<
        MutationOptions<CreateSnippetSuccessRes, CreateSnippetErrorRes, Input>,
        'mutationFn' | 'mutationKey'
    >,
) {
    return useMutation({
        mutationKey: ['create-snippet'],
        mutationFn: async input => {
            const res = await api.post<CreateSnippetSuccessRes>(serverEndpoints.createSnippet, input);
            return res.data;
        },
        ...options,
    });
}

export function useGetCreateSnippetMutationState() {
    return useMutationState({
        filters: { mutationKey: ['create-snippet'] },
        select: mutation => mutation.state,
    });
}
