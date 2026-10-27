import { type AuthenticateDeveloperDtoType, type LogoutDeveloperDtoType } from '@snippetly/common/dto';
import { AUTH_TOKEN_HEADER_KEY } from '@snippetly/common/lib';
import { apiEndpoints, apiUrl } from './api-endpoints';
import { LOCAL_STORAGE_SESSION_TOKEN_KEY } from './constants';

type ApiErrorPayload = {
    code: string;
    httpStatusCode: number;
    message: string;
};

export type ApiSuccess<TOutput> = TOutput extends ApiErrorPayload ? never : TOutput;

export class OfflineNetworkError extends Error {
    public readonly isOffline = true;

    constructor(message = 'You are offline. Reconnect to access data that is not cached on this device.') {
        super(message);
        this.name = 'OfflineNetworkError';
    }
}

export class OfflineDataUnavailableError extends OfflineNetworkError {
    constructor() {
        super(
            'This data is not cached on this device. Reconnect to the internet and visit this section to make it available offline.',
        );
        this.name = 'OfflineDataUnavailableError';
    }
}

export function isOfflineNetworkError(error: unknown): error is OfflineNetworkError {
    return error instanceof OfflineNetworkError;
}

export function assertApiSuccess<TOutput>(
    response: Response,
    payload: unknown,
): asserts payload is ApiSuccess<TOutput> {
    if (!response.ok || isApiErrorPayload(payload)) {
        throw new ApiClientError(response, payload);
    }
}

export class ApiClientError extends Error {
    public readonly code?: string;
    public readonly httpStatusCode: number;

    constructor(
        public readonly response: Response,
        public readonly payload: unknown,
    ) {
        const errorPayload = isApiErrorPayload(payload) ? payload : undefined;
        super(
            errorPayload?.message || response.statusText || `Request failed with status ${response.status}`,
        );
        this.name = 'ApiClientError';
        this.code = errorPayload?.code;
        this.httpStatusCode = errorPayload?.httpStatusCode ?? response.status;
    }
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
    return (
        typeof value === 'object' &&
        value !== null &&
        'code' in value &&
        typeof value.code === 'string' &&
        'httpStatusCode' in value &&
        typeof value.httpStatusCode === 'number' &&
        'message' in value &&
        typeof value.message === 'string'
    );
}

export class ApiClient {
    constructor(private apiUrl: string = '') {}

    public setAuthToken(token: string) {
        localStorage.setItem(LOCAL_STORAGE_SESSION_TOKEN_KEY, token);
    }

    public getAuthToken(): string {
        return localStorage.getItem(LOCAL_STORAGE_SESSION_TOKEN_KEY) ?? '';
    }

    private async fetchResponse(url: string, options: RequestInit): Promise<Response> {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            throw new OfflineNetworkError();
        }

        try {
            return await fetch(url, options);
        } catch (error) {
            if (error instanceof TypeError || (typeof navigator !== 'undefined' && !navigator.onLine)) {
                throw new OfflineNetworkError();
            }
            throw error;
        }
    }

    async asUserWithCredentials(identifier: string, password: string) {
        return this.asUserWithAuthInput({
            native: { identifier, password },
        });
    }

    async asUserWithAuthInput(authInput: Partial<AuthenticateDeveloperDtoType['input']>) {
        // first log out as the current user
        if (this.getAuthToken()) {
            await this.fetch<LogoutDeveloperDtoType['output']>(apiEndpoints.auth.logout.url, {
                method: apiEndpoints.auth.logout.method,
            });
        }
        return this.fetch<AuthenticateDeveloperDtoType['output']>(apiEndpoints.auth.authenticate.url, {
            method: apiEndpoints.auth.authenticate.method,
            body: JSON.stringify(authInput),
        });
    }

    async asAnonymousUser(): Promise<void> {
        await this.fetch<LogoutDeveloperDtoType['output']>(apiEndpoints.auth.logout.url, {
            method: apiEndpoints.auth.logout.method,
        });
        localStorage.removeItem(LOCAL_STORAGE_SESSION_TOKEN_KEY);
    }

    public async fetch<TOutput>(url: string, options: RequestInit = {}): Promise<ApiSuccess<TOutput>> {
        const headers = new Headers(options.headers);
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        if (this.getAuthToken()) {
            headers.set('Authorization', `Bearer ${this.getAuthToken()}`);
        } else {
            headers.delete('Authorization');
        }

        const requestUrl = /^https?:\/\//.test(url) ? url : `${this.apiUrl}${url}`;
        const response = await this.fetchResponse(requestUrl, {
            ...options,
            headers,
        });
        const authToken = response.headers.get(AUTH_TOKEN_HEADER_KEY);
        if (authToken != null) {
            this.setAuthToken(authToken);
        }

        let payload: unknown;
        try {
            payload = await response.json();
        } catch {
            throw new ApiClientError(response, undefined);
        }

        assertApiSuccess<TOutput>(response, payload);
        return payload;
    }

    public async fetchWithToken<TOutput>(
        url: string,
        options: RequestInit,
        token: string,
        onTokenRefresh?: (token: string) => void | Promise<void>,
    ): Promise<ApiSuccess<TOutput>> {
        const headers = new Headers(options.headers);
        if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
        if (token) headers.set('Authorization', `Bearer ${token}`);
        else headers.delete('Authorization');

        const requestUrl = /^https?:\/\//.test(url) ? url : `${this.apiUrl}${url}`;
        const response = await this.fetchResponse(requestUrl, { ...options, headers });
        const authToken = response.headers.get(AUTH_TOKEN_HEADER_KEY);
        if (authToken !== null && onTokenRefresh) await onTokenRefresh(authToken);

        let payload: unknown;
        try {
            payload = await response.json();
        } catch {
            throw new ApiClientError(response, undefined);
        }

        assertApiSuccess<TOutput>(response, payload);
        return payload;
    }
}

export const developerApiClient = new ApiClient(apiUrl('', 'developer', 1));
