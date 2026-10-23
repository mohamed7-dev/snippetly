import { useAuth } from '@/features/auth/hooks/use-auth';
import {
    cacheOfflineCollectionOptions,
    getOfflineOwnerId,
    queueOfflineCollectionCreation,
} from '@/features/offline-snippet/lib/store';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { ApiClientError, developerApiClient, type ApiSuccess } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import type { AsyncActionCallback } from '@/lib/types';
import type { CreateCollectionDtoType } from '@snippetly/common/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type CreatedCollection = ApiSuccess<CreateCollectionDtoType['output']>;
export type CreateCollectionResult =
    { status: 'synced'; data: CreatedCollection } | { status: 'queued'; id: string };

export type MutationCallbacks = AsyncActionCallback<CreateCollectionResult, ApiClientError>;

export function useCreateCollection(mutationCallbacks?: MutationCallbacks) {
    const qClient = useQueryClient();
    const { user } = useAuth();
    return useMutation({
        mutationFn: async (input: CreateCollectionDtoType['input']): Promise<CreateCollectionResult> => {
            const ownerId = user?.id ?? getOfflineOwnerId();
            const queueLocally = async (): Promise<CreateCollectionResult> => {
                if (!ownerId) {
                    throw new Error('Sign in on this device before creating collections offline.');
                }
                const collection = await queueOfflineCollectionCreation(ownerId, input);
                return { status: 'queued', id: collection.id };
            };

            if (!navigator.onLine) return queueLocally();

            try {
                const data = await developerApiClient.fetch<CreateCollectionDtoType['output']>(
                    apiEndpoints.collections.create.url,
                    {
                        method: apiEndpoints.collections.create.method,
                        body: JSON.stringify(input),
                    },
                );
                return { status: 'synced', data };
            } catch (error) {
                if (error instanceof TypeError && ownerId) return queueLocally();
                throw error;
            }
        },
        ...mutationCallbacks,
        onSuccess: async data => {
            if (data.status === 'queued') {
                toast.success('Collection saved on this device and will sync when you are online.');
            } else {
                toast.success('Collection was created successfully');
                void qClient.invalidateQueries(getCurrentDeveloperActivityStats());
                try {
                    await cacheOfflineCollectionOptions([
                        {
                            id: data.data.id,
                            name: data.data.name,
                            color: data.data.color,
                            ownerId: data.data.creator.id,
                        },
                    ]);
                } catch (error) {
                    console.error('Could not cache the created collection for offline use.', error);
                    toast.error('The collection was created but could not be saved for offline use.');
                }
            }
            mutationCallbacks?.onSuccess?.(data);
        },
        onError: e => {
            toastApiError(e);
            mutationCallbacks?.onError?.(e as ApiClientError);
        },
    });
}
