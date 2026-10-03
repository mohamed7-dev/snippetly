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
    login: (credentials: Credentials, userType: UserType, onSuccess?: () => void) => void;
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
        error: activeUserError,
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

    const onLoginSuccess = React.useCallback(
        async (data: ApiSuccess<AuthenticateDeveloperDtoType['output']>, onSuccess?: () => void) => {
            if (data?.identifier) {
                setAuthError(undefined);
                await refetchActiveUser();
                await queryClient.invalidateQueries();
                setAuthStatus('authenticated');
                setIsActiveAuthMutationInProgress(false);
                onSuccess?.();
            }
        },
        [],
    );

    const login = React.useCallback(
        (credentials: Credentials, userType: UserType, onSuccess?: () => void) => {
            if (credentials.native) {
                developerApiClient
                    .asUserWithCredentials(credentials.native.identifier, credentials.native.password)
                    .then(async data => {
                        onLoginSuccess(data, onSuccess);
                    })
                    .catch(e => {
                        const formattedErr = toastApiError(e);
                        setAuthError(formattedErr.title);
                        setAuthStatus('authenticated');
                        setIsActiveAuthMutationInProgress(false);
                    });
            }
        },
        [queryClient, refetchActiveUser, onLoginSuccess],
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

        if (authStatus === 'initial' && isLoadingActiveUser) {
            // user info is being loaded and the auth status indicates that no authentication happened
            // so this is considered an active verification
            setAuthStatus('verifying');
        }

        if (!isLoadingActiveUser && authStatus === 'verifying') {
            // user info is done being loaded and the auth status indicates that authentication is done verifying
            // so we need to decide the auth state
            if (!activeUserError || !activeUserData?.id) {
                setAuthStatus('unauthenticated');
            } else {
                setAuthStatus('authenticated');
            }
        }
    }, [authStatus, isLoadingActiveUser, activeUserError, activeUserData, isActiveAuthMutationInProgress]);

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
