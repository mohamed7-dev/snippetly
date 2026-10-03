import { type AuthenticateDeveloperDtoType, type LogoutDeveloperDtoType } from '@snippetly/common/dto';
import { AUTH_TOKEN_HEADER_KEY } from '@snippetly/common/lib';
import { apiEndpoints } from './api-endpoints';
import { DEVELOPER_API_URL, LOCAL_STORAGE_SESSION_TOKEN_KEY } from './constants';

type ApiErrorPayload = {
    code: string;
    httpStatusCode: number;
    message: string;
};

export type ApiSuccess<TOutput> = TOutput extends ApiErrorPayload ? never : TOutput;

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

    async asUserWithCredentials(identifier: string, password: string) {
        // first log out as the current user
        if (this.getAuthToken()) {
            await this.fetch<LogoutDeveloperDtoType['output']>(apiEndpoints.auth.logout.url, {
                method: apiEndpoints.auth.logout.method,
            });
        }
        return this.fetch<AuthenticateDeveloperDtoType['output']>(apiEndpoints.auth.authenticate.url, {
            method: apiEndpoints.auth.authenticate.method,
            body: JSON.stringify({
                native: { identifier, password },
            } as AuthenticateDeveloperDtoType['input']),
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

        const requestUrl = /^https?:\/\//.test(url)
            ? url
            : `${this.apiUrl}${url.startsWith('/') ? url : `/${url}`}`;
        const response = await fetch(requestUrl, {
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
}

export const developerApiClient = new ApiClient(DEVELOPER_API_URL);
