import { developerApiClient } from '@/lib/api-client.js';
import { apiEndpoints } from '@/lib/api-endpoints.js';
import { LOCAL_STORAGE_SESSION_TOKEN_KEY } from '@/lib/constants.js';
import type { ActiveDeveloperDtoType, AuthenticateDeveloperDtoType } from '@snippetly/common/dto';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

const ACTIVE_USER_QUERY_KEY = 'activeUser';

type Credentials = AuthenticateDeveloperDtoType['input'];

export interface AuthContextType {
    isAuthenticated: boolean;
    status: 'initial' | 'authenticated' | 'verifying' | 'unauthenticated';
    errorMessage?: string;
    login: (credentials: Credentials, onSuccess?: () => void) => void;
    logout: (onSuccess?: () => void) => Promise<void>;
    refreshActiveUser: () => void;
    /**
     * @description
     * The developer user info.
     */
    user: ActiveDeveloperDtoType['output'] | undefined;
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
            const res = await developerApiClient.fetch(apiEndpoints.developers.getActiveDeveloper.url, {
                method: apiEndpoints.developers.getActiveDeveloper.method,
            });
            const result = (await res.json()) as ActiveDeveloperDtoType['output'];
            if (result === null) {
                return undefined;
            }

            return result;
        },
        retry: false, // Disable retries to avoid waiting for multiple attempts
    });

    const login = React.useCallback(
        (credentials: Credentials, onSuccess?: () => void) => {
            if (credentials.native) {
                developerApiClient
                    .asUserWithCredentials(credentials.native.identifier, credentials.native.password)
                    .then(async data => {
                        onLogin(data, onSuccess);
                    });
            }
        },
        [queryClient, refetchActiveUser],
    );

    const onLogin = React.useCallback(
        async (data: AuthenticateDeveloperDtoType['output'], onSuccess?: () => void) => {
            if (data?.identifier) {
                setAuthError(undefined);
                await refetchActiveUser();
                await queryClient.invalidateQueries();
                setAuthStatus('authenticated');
                setIsActiveAuthMutationInProgress(false);
                onSuccess?.();
            } else {
                setAuthError(data?.authenticateAdminUser.message);
                setAuthStatus('unauthenticated');
                setIsActiveAuthMutationInProgress(false);
            }
        },
        [],
    );

    const logout = React.useCallback(
        async (onLogoutSuccess?: () => void) => {
            setIsActiveAuthMutationInProgress(true);
            setAuthStatus('verifying');
            developerApiClient.asAnonymousUser().then(async () => {
                localStorage.removeItem(LOCAL_STORAGE_SESSION_TOKEN_KEY);
                queryClient.clear();
                setAuthStatus('unauthenticated');
                setIsActiveAuthMutationInProgress(false);
                onLogoutSuccess?.();
            });
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
            if (!activeUserError || !activeUserData?.me?.id) {
                setAuthStatus('unauthenticated');
            } else {
                setAuthStatus('authenticated');
            }
        }
    }, [authStatus, isLoadingActiveUser, activeUserError, activeUserData, isActiveAuthMutationInProgress]);

    const isAuthenticated = !!activeUserData?.me?.id;

    const contextValue = React.useMemo(() => {
        return {
            login,
            logout,
            errorMessage: authError,
            status: authStatus,
            isAuthenticated,
            refreshActiveUser: invalidateActiveUser,
            user: activeUserData,
        } satisfies AuthContextType;
    }, [login, logout, authError, authStatus, invalidateActiveUser, isAuthenticated, activeUserData]);
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
