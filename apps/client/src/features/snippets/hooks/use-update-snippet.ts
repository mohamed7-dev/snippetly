import { updateSavedSnippet } from '@/features/snippets/lib/snippets-store';
import { api } from '@/lib/api-client';
import { serverEndpoints } from '@/lib/routes';
import type { ErrorResponse, SharedSuccessRes } from '@/lib/types';
import { useMutation, useMutationState, type MutationOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { EditSnippetSchema } from '../lib/schema';
import type { Snippet } from '../lib/types';

type Input = {
    data: Omit<EditSnippetSchema, 'isPublic'> & { isPrivate: boolean };
    slug: string;
};

type UpdateSnippetSuccessRes = SharedSuccessRes<
    Omit<Snippet, 'forkedFrom'> & {
        isForked: boolean;
        collectionPublicId: string;
        creatorName: string;
    }
>;
type UpdateSnippetErrorRes = AxiosError<ErrorResponse>;

export function useUpdateSnippet(
    options?: Omit<
        MutationOptions<UpdateSnippetSuccessRes, UpdateSnippetErrorRes, Input>,
        'mutationFn' | 'mutationKey'
    >,
) {
    return useMutation({
        ...options,
        mutationKey: ['update-snippet'],
        mutationFn: async ({ slug, data }) => {
            const res = await api.put<UpdateSnippetSuccessRes>(serverEndpoints.updateSnippet(slug), data);
            return res.data;
        },
        onSuccess: async (result, variables, context) => {
            try {
                const d = result.data;
                await updateSavedSnippet({
                    publicId: d.publicId,
                    title: d.title,
                    code: d.code,
                    language: d.language,
                    description: d.description,
                    creatorName: d.creatorName,
                    note: d.note,
                });
            } catch (e) {
                console.warn('[offline] Failed to update saved snippet after edit:', e);
            }
            await options?.onSuccess?.(result, variables, context);
        },
    });
}

export function useGetUpdateSnippetMutationState() {
    return useMutationState({
        filters: { mutationKey: ['update-snippet'] },
        select: mutation => mutation.state,
    });
}
