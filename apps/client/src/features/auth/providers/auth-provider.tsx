import { developerApiClient, type ApiSuccess } from '@/lib/api-client.js';
import { apiEndpoints } from '@/lib/api-endpoints.js';
import { LOCAL_STORAGE_SESSION_TOKEN_KEY } from '@/lib/constants.js';
import { toastApiError } from '@/lib/toast-api-error';
import type { UserType } from '@/lib/types';
import type { ActiveDeveloperDtoType, AuthenticateDeveloperDtoType } from '@snippetly/common/dto';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

const ACTIVE_USER_QUERY_KEY = 'activeUser';

type Credentials = AuthenticateDeveloperDtoType['input'];

export interface AuthContextType {
    isAuthenticated: boolean;
    isActiveAuthMutationInProgress: boolean;
    status: 'initial' | 'authenticated' | 'verifying' | 'unauthenticated';
    errorMessage?: string;
    login: (
        credentials: Credentials,
        userType: UserType,
        onSuccess?: () => void | Promise<void>,
    ) => Promise<void>;
    logout: (userType: UserType, onSuccess?: () => void) => Promise<void>;
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
        async (
            credentials: Credentials,
            _userType: UserType,
            onSuccess?: () => void | Promise<void>,
        ) => {
            if (!credentials.native) return;

            setIsActiveAuthMutationInProgress(true);
            setAuthStatus('verifying');

            try {
                const data = await developerApiClient.asUserWithCredentials(
                    credentials.native.identifier,
                    credentials.native.password,
                );
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
        async (userType: UserType, onLogoutSuccess?: () => void) => {
            setIsActiveAuthMutationInProgress(true);
            setAuthStatus('verifying');
            developerApiClient
                .asAnonymousUser()
                .then(async () => {
                    localStorage.removeItem(LOCAL_STORAGE_SESSION_TOKEN_KEY);
                    queryClient.clear();
                    setAuthStatus('unauthenticated');
                    setIsActiveAuthMutationInProgress(false);
                    onLogoutSuccess?.();
                })
                .catch(toastApiError);
        },
        [queryClient],
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

    const isAuthenticated = !!activeUserData?.id;

    const contextValue = React.useMemo(() => {
        return {
            login,
            logout,
            errorMessage: authError,
            status: authStatus,
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
        invalidateActiveUser,
        isAuthenticated,
        isActiveAuthMutationInProgress,
        activeUserData,
    ]);
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
