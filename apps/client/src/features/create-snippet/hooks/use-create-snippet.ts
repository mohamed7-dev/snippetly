import { useAuth } from '@/features/auth/hooks/use-auth';
import {
    getOfflineOwnerId,
    queueOfflineSnippetCreation,
    resolveOfflineCollectionId,
} from '@/features/offline-snippet/lib/store';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { CreateSnippetDtoType } from '@snippetly/common/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type CreatedSnippet = ApiSuccess<CreateSnippetDtoType['output']>;
export type CreateSnippetResult =
    { status: 'synced'; data: CreatedSnippet } | { status: 'queued'; id: string };

export type CreateSnippetMutationCallbacks = AsyncActionCallback<CreateSnippetResult, ApiClientError>;

export function useCreateSnippet(mutationCallbacks?: CreateSnippetMutationCallbacks) {
    const qClient = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: async (input: CreateSnippetDtoType['input']): Promise<CreateSnippetResult> => {
            const ownerId = user?.id ?? getOfflineOwnerId();
            const queueLocally = async (snippetInput = input): Promise<CreateSnippetResult> => {
                if (!ownerId) {
                    throw new Error('Sign in on this device before creating snippets offline.');
                }
                const snippet = await queueOfflineSnippetCreation(ownerId, snippetInput);
                return { status: 'queued', id: snippet.id };
            };

            if (!navigator.onLine) return queueLocally();

            let inputToCreate = input;
            if (user?.id && input.collectionId) {
                const collectionId = await resolveOfflineCollectionId(user.id, input.collectionId);
                if (!collectionId) return queueLocally();
                inputToCreate = { ...input, collectionId };
            }

            try {
                const data = await developerApiClient.fetch<CreateSnippetDtoType['output']>(
                    apiEndpoints.snippets.create.url,
                    {
                        method: apiEndpoints.snippets.create.method,
                        body: JSON.stringify(inputToCreate),
                    },
                );
                return { status: 'synced', data };
            } catch (error) {
                if (error instanceof TypeError && ownerId) return queueLocally(inputToCreate);
                throw error;
            }
        },
        ...mutationCallbacks,
        onSuccess: data => {
            if (data.status === 'queued') {
                toast.success('Snippet saved on this device and will sync when you are online.');
            } else {
                toast.success('Snippet was created successfully');
                void qClient.invalidateQueries(getCurrentDeveloperActivityStats());
            }
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
