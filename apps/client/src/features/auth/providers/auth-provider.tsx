import { requestOfflineCreationSync } from '@/features/offline-snippet/lib/register-background-sync';
import { removeOfflineSyncCredential, saveOfflineSyncCredential } from '@/features/offline-snippet/lib/store';
import { developerApiClient, type ApiSuccess } from '@/lib/api-client.js';
import { apiEndpoints } from '@/lib/api-endpoints.js';
import { LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY, LOCAL_STORAGE_SESSION_TOKEN_KEY } from '@/lib/constants.js';
import { toastApiError } from '@/lib/toast-api-error';
import type { UserType } from '@/lib/types';
import type { ActiveDeveloperDtoType, AuthenticateDeveloperDtoType } from '@snippetly/common/dto';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

const ACTIVE_USER_QUERY_KEY = 'activeUser';

type Credentials = Partial<AuthenticateDeveloperDtoType['input']>;
type ResolvedAuthStatus = Extract<AuthContextType['status'], 'authenticated' | 'unauthenticated'>;

export interface AuthContextType {
    isAuthenticated: boolean;
    isActiveAuthMutationInProgress: boolean;
    status: 'initial' | 'authenticated' | 'verifying' | 'unauthenticated';
    errorMessage?: string;
    waitForAuthResolution: () => Promise<ResolvedAuthStatus>;
    login: (
        credentials: Credentials,
        userType: UserType,
        onSuccess?: () => void | Promise<void>,
    ) => Promise<void>;
    logout: (userType: UserType, onSuccess?: () => void | Promise<void>) => Promise<void>;
    refreshActiveUser: () => void;
    /**
     * @description
     * The developer user info.
     */
    user: ApiSuccess<ActiveDeveloperDtoType['output']> | undefined;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}
export function AuthProvider({ children }: AuthProviderProps) {
    const queryClient = useQueryClient();
    const [authStatus, setAuthStatus] = React.useState<AuthContextType['status']>('initial');
    const [authError, setAuthError] = React.useState<string | undefined>();
    const [isActiveAuthMutationInProgress, setIsActiveAuthMutationInProgress] = React.useState(false);
    const authResolutionWaiters = React.useRef<Set<(status: ResolvedAuthStatus) => void>>(new Set());

    const {
        data: activeUserData,
        isLoading: isLoadingActiveUser,
        refetch: refetchActiveUser,
    } = useQuery({
        queryKey: [ACTIVE_USER_QUERY_KEY],
        queryFn: async () => {
            const result = await developerApiClient.fetch<ActiveDeveloperDtoType['output']>(
                apiEndpoints.developers.getActiveDeveloper.url,
                { method: apiEndpoints.developers.getActiveDeveloper.method },
            );
            if (result === null) {
                return undefined;
            }

            return result;
        },
        retry: false, // Disable retries to avoid waiting for multiple attempts
    });

    const login = React.useCallback(
        async (credentials: Credentials, _userType: UserType, onSuccess?: () => void | Promise<void>) => {
            if (!credentials.native && !credentials.google) {
                throw new Error('Authentication credentials are required');
            }

            setIsActiveAuthMutationInProgress(true);
            setAuthStatus('verifying');

            try {
                const data = await developerApiClient.asUserWithAuthInput(credentials);
                if (!data?.identifier) {
                    throw new Error('Authentication response did not include the signed-in user');
                }

                setAuthError(undefined);
                const activeUserResult = await refetchActiveUser({ throwOnError: true });
                if (!activeUserResult.data?.id) {
                    throw new Error('The authenticated user could not be loaded');
                }

                setAuthStatus('authenticated');
            } catch (error) {
                const formattedErr = toastApiError(error);
                setAuthError(formattedErr.title);
                setAuthStatus('unauthenticated');
                throw error;
            } finally {
                setIsActiveAuthMutationInProgress(false);
            }

            await onSuccess?.();
        },
        [refetchActiveUser],
    );

    const logout = React.useCallback(
        async (_userType: UserType, onLogoutSuccess?: () => void | Promise<void>) => {
            setIsActiveAuthMutationInProgress(true);
            setAuthStatus('verifying');

            try {
                const ownerId = activeUserData?.id;
                developerApiClient.setOfflineOwnerId(undefined);
                await developerApiClient.asAnonymousUser();
                if (ownerId) await removeOfflineSyncCredential(ownerId);
                localStorage.removeItem(LOCAL_STORAGE_SESSION_TOKEN_KEY);
                localStorage.removeItem(LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY);
                queryClient.clear();
                setAuthStatus('unauthenticated');
                await onLogoutSuccess?.();
            } catch (error) {
                toastApiError(error);
            } finally {
                setIsActiveAuthMutationInProgress(false);
            }
        },
        [activeUserData?.id, queryClient],
    );

    const invalidateActiveUser = React.useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: [ACTIVE_USER_QUERY_KEY],
        });
    }, [queryClient]);

    React.useEffect(() => {
        // we must not perform any side effect while a mutation is active
        if (isActiveAuthMutationInProgress) return;
        if (isLoadingActiveUser) {
            setAuthStatus('verifying');
            return;
        }

        setAuthStatus(activeUserData?.id ? 'authenticated' : 'unauthenticated');
    }, [isLoadingActiveUser, activeUserData?.id, isActiveAuthMutationInProgress]);

    React.useEffect(() => {
        if (authStatus !== 'authenticated' && authStatus !== 'unauthenticated') return;

        for (const resolve of authResolutionWaiters.current) {
            resolve(authStatus);
        }
        authResolutionWaiters.current.clear();
    }, [authStatus]);

    const waitForAuthResolution = React.useCallback(() => {
        if (authStatus === 'authenticated' || authStatus === 'unauthenticated') {
            return Promise.resolve(authStatus);
        }

        return new Promise<ResolvedAuthStatus>(resolve => {
            authResolutionWaiters.current.add(resolve);
        });
    }, [authStatus]);

    React.useEffect(() => {
        if (activeUserData?.id) {
            localStorage.setItem(LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY, activeUserData.id);
            developerApiClient.setOfflineOwnerId(activeUserData.id);
        } else if (authStatus === 'unauthenticated') {
            developerApiClient.setOfflineOwnerId(undefined);
        }
    }, [activeUserData?.id, authStatus]);

    const wakeServiceWorkerSync = React.useCallback(async (userId: string) => {
        const token = developerApiClient.getAuthToken();
        if (!token) return;
        await saveOfflineSyncCredential(userId, token);
        await requestOfflineCreationSync();
    }, []);

    React.useEffect(() => {
        if (!activeUserData?.id || !navigator.onLine) return;

        void wakeServiceWorkerSync(activeUserData.id).catch(error => {
            toastApiError(error);
        });
    }, [activeUserData?.id, wakeServiceWorkerSync]);

    React.useEffect(() => {
        const refreshSessionWhenOnline = async () => {
            try {
                const result = await refetchActiveUser({ throwOnError: true });
                if (result.data?.id) {
                    localStorage.setItem(LOCAL_STORAGE_OFFLINE_OWNER_ID_KEY, result.data.id);
                    developerApiClient.setOfflineOwnerId(result.data.id);
                    await wakeServiceWorkerSync(result.data.id);
                }
            } catch (error) {
                toastApiError(error);
            }
        };

        window.addEventListener('online', refreshSessionWhenOnline);
        return () => window.removeEventListener('online', refreshSessionWhenOnline);
    }, [refetchActiveUser, wakeServiceWorkerSync]);

    React.useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        const onServiceWorkerMessage = (event: MessageEvent<unknown>) => {
            if (
                typeof event.data !== 'object' ||
                event.data === null ||
                !('type' in event.data) ||
                event.data.type !== 'offline-creation-sync-complete'
            ) {
                return;
            }
            void queryClient.invalidateQueries({ queryKey: ['collections'] });
            void queryClient.invalidateQueries({ queryKey: ['snippets'] });
        };

        navigator.serviceWorker.addEventListener('message', onServiceWorkerMessage);
        return () => navigator.serviceWorker.removeEventListener('message', onServiceWorkerMessage);
    }, [queryClient]);

    const isAuthenticated = !!activeUserData?.id;

    const contextValue = React.useMemo(() => {
        return {
            login,
            logout,
            errorMessage: authError,
            status: authStatus,
            waitForAuthResolution,
            isAuthenticated,
            refreshActiveUser: invalidateActiveUser,
            user: activeUserData,
            isActiveAuthMutationInProgress: isActiveAuthMutationInProgress,
        } satisfies AuthContextType;
    }, [
        login,
        logout,
        authError,
        authStatus,
        waitForAuthResolution,
        invalidateActiveUser,
        isAuthenticated,
        isActiveAuthMutationInProgress,
        activeUserData,
    ]);
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
