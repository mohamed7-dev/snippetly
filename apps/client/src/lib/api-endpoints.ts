import { DEFAULT_ADMIN_API_PATH_PREFIX, DEFAULT_DEVELOPER_API_PATH_PREFIX } from '@snippetly/common/lib';
import { API_URL } from './constants';
import type { UserType } from './types';

export const apiUrl = (path: string, apiType?: UserType, apiVersion?: number) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (!API_URL) {
        throw new Error('Missing API_URL env variable.');
    }
    const normalizedApiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return `${normalizedApiUrl}${apiVersion ? '/v' + apiVersion : ''}${apiType ? (apiType === 'admin' ? '/' + DEFAULT_ADMIN_API_PATH_PREFIX : '/' + DEFAULT_DEVELOPER_API_PATH_PREFIX) : ''}${normalizedPath}`;
};

export interface ApiEndpoint {
    url: string | ((...args: never[]) => string);
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
    contentType?: 'application/json' | null;
}

export const apiEndpoints = {
    auth: {
        registerDeveloper: {
            url: 'auth/accounts',
            method: 'POST',
        },
        getActiveUser: {
            url: 'auth/accounts/me',
            method: 'GET',
            contentType: null,
        },
        updateCurrentUserPassword: {
            url: 'auth/accounts/me',
            method: 'PATCH',
        },
        authenticate: {
            url: 'auth/sessions',
            method: 'POST',
        },
        logout: {
            url: 'auth/sessions/current',
            method: 'DELETE',
            contentType: null,
        },
        listSessions: {
            url: 'auth/sessions',
            method: 'GET',
            contentType: null,
        },
        revokeSession: {
            url: (id: string) => `auth/sessions/${id}`,
            method: 'DELETE',
            contentType: null,
        },
        refreshVerificationToken: {
            url: 'auth/verification-tokens',
            method: 'POST',
        },
        verifyAccount: {
            url: 'auth/account-verifications',
            method: 'POST',
        },
        requestEmailAddressChange: {
            url: 'auth/account-email-address-change',
            method: 'POST',
        },
        changeEmailAddress: {
            url: 'auth/account-email-address-change',
            method: 'PATCH',
        },
        requestPasswordReset: {
            url: 'auth/account-password-change',
            method: 'POST',
        },
        resetPassword: {
            url: 'auth/account-password-change',
            method: 'PATCH',
        },
    },
    snippets: {
        create: {
            url: 'snippets',
            method: 'POST',
        },
        update: {
            url: (id: string) => `snippets/${id}`,
            method: 'PATCH',
        },
        delete: {
            url: (id: string) => `snippets/${id}`,
            method: 'DELETE',
            contentType: null,
        },
        restore: {
            url: (id: string) => `snippets/${id}/restore`,
            method: 'PATCH',
        },
        permanentlyDelete: {
            url: (id: string) => `snippets/${id}/permanent`,
            method: 'DELETE',
            contentType: null,
        },
        fork: {
            url: (id: string) => `snippets/${id}/forks`,
            method: 'POST',
        },
        findOne: {
            url: (id: string) => `snippets/${id}`,
            method: 'GET',
            contentType: null,
        },
        list: {
            url: (searchParams: URLSearchParams) => `snippets?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
        listMine: {
            url: (searchParams: URLSearchParams) => `snippets/me?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
        listTrash: {
            url: (searchParams: URLSearchParams) => `snippets/trash?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
        listFriends: {
            url: (searchParams: URLSearchParams) => `snippets/friends?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
    },
    collections: {
        create: {
            url: 'collections',
            method: 'POST',
        },
        update: {
            url: (id: string) => `collections/${id}`,
            method: 'PATCH',
        },
        delete: {
            url: (id: string) => `collections/${id}`,
            method: 'DELETE',
            contentType: null,
        },
        restore: {
            url: (id: string) => `collections/${id}/restore`,
            method: 'PATCH',
        },
        permanentlyDelete: {
            url: (id: string) => `collections/${id}/permanent`,
            method: 'DELETE',
            contentType: null,
        },
        fork: {
            url: (id: string) => `collections/${id}/forks`,
            method: 'POST',
            contentType: null,
        },
        findOne: {
            url: (id: string) => `collections/${id}`,
            method: 'GET',
            contentType: null,
        },
        list: {
            url: (searchParams: URLSearchParams) => `collections?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
        listMine: {
            url: (searchParams: URLSearchParams) => `collections/me?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
        listTrash: {
            url: (searchParams: URLSearchParams) => `collections/trash?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
    },
    developers: {
        update: {
            url: `developers/me`,
            method: 'PATCH',
        },
        delete: {
            url: `developers/me`,
            method: 'DELETE',
            contentType: null,
        },
        findOne: {
            url: (id: string) => `developers/${id}`,
            method: 'GET',
            contentType: null,
        },
        getActiveDeveloper: {
            url: `developers/me`,
            method: 'GET',
            contentType: null,
        },
        getActiveDeveloperStats: {
            url: `developers/me/activity`,
            method: 'GET',
            contentType: null,
        },
        getPreferences: {
            url: 'preferences/me',
            method: 'GET',
            contentType: null,
        },
        updatePreferences: {
            url: 'preferences/me',
            method: 'PATCH',
        },
        list: {
            url: (searchParams: URLSearchParams) => `developers?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
    },
    notifications: {
        list: {
            url: (searchParams: URLSearchParams) => `notifications?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
        dismiss: {
            url: (id: string) => `notifications/${id}`,
            method: 'DELETE',
            contentType: null,
        },
    },
    search: {
        query: {
            url: (searchParams: URLSearchParams) => `search?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
    },
    tags: {
        popularList: {
            url: (searchParams: URLSearchParams) => `tags/popular?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
    },
    friendships: {
        request: {
            url: (friendId: string) => `friendships/${friendId}/requests`,
            method: 'POST',
            contentType: null,
        },
        accept: {
            url: (friendId: string) => `friendships/${friendId}/accept`,
            method: 'PATCH',
            contentType: null,
        },
        reject: {
            url: (friendId: string) => `friendships/${friendId}/reject`,
            method: 'PATCH',
            contentType: null,
        },
        cancel: {
            url: (friendId: string) => `friendships/${friendId}`,
            method: 'DELETE',
            contentType: null,
        },
        listCurrentUserFriends: {
            url: (searchParams: URLSearchParams) => `friendships/current?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
        listCurrentUserInbox: {
            url: (searchParams: URLSearchParams) => `friendships/inbox?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
        listCurrentUserOutbox: {
            url: (searchParams: URLSearchParams) => `friendships/outbox?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
    },
    pushNotifications: {
        publicKey: {
            url: 'push-notifications/public-key',
            method: 'GET',
            contentType: null,
        },
        subscribe: {
            url: 'push-notifications/subscriptions',
            method: 'POST',
        },
        unsubscribe: {
            url: 'push-notifications/subscriptions',
            method: 'DELETE',
        },
    },
    favourites: {
        add: {
            url: (resourceType: string, id: string) => `favourites/${resourceType}/${id}`,
            method: 'POST',
        },
        remove: {
            url: (resourceType: string, id: string) => `favourites/${resourceType}/${id}`,
            method: 'DELETE',
            contentType: null,
        },
        snippets: {
            url: (searchParams: URLSearchParams) => `favourites/snippets?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
        collections: {
            url: (searchParams: URLSearchParams) => `favourites/collections?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
        developers: {
            url: (searchParams: URLSearchParams) => `favourites/developers?${searchParams.toString()}`,
            method: 'GET',
            contentType: null,
        },
    },
    slugs: {
        generateSlugForEntity: {
            url: `slugs`,
            method: 'PUT',
        },
    },
    upload: {
        base: {
            url: apiUrl('upload'),
            method: 'POST',
        },
        profileImage: {
            url: 'upload-avatar',
            method: 'POST',
        },
    },
} as const satisfies Record<string, Record<string, ApiEndpoint>>;
