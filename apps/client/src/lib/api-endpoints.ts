import { DEVELOPER_API_URL } from './constants';

export const apiUrl = (path: string) => {
    return `${DEVELOPER_API_URL}/${path}`;
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
        list: {
            url: (searchParams: URLSearchParams) => `developers?${searchParams.toString()}`,
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
    slugs: {
        generateSlugForEntity: {
            url: `slugs`,
            method: 'PUT',
        },
    },
} as const satisfies Record<string, Record<string, ApiEndpoint>>;
