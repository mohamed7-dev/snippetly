import { type AuthenticateDeveloperDtoType } from '@snippetly/common/dto';
import { AUTH_TOKEN_HEADER_KEY } from '@snippetly/common/lib';
import { apiEndpoints } from './api-endpoints';
import { DEVELOPER_API_URL } from './constants';

export class ApiClient {
    private authToken: string = '';
    private headers: { [key: string]: unknown } = {};

    constructor(private apiUrl: string = '') {}

    public setAuthToken(token: string) {
        this.authToken = token;
        this.headers.Authorization = `Bearer ${this.authToken}`;
    }

    public getAuthToken(): string {
        return this.authToken;
    }

    async asUserWithCredentials(identifier: string, password: string) {
        // first log out as the current user
        if (this.authToken) {
            await this.fetch(apiEndpoints.auth.logoutDeveloper.url, {
                method: apiEndpoints.auth.logoutDeveloper.method,
            });
        }
        const res = await this.fetch(apiEndpoints.auth.authenticateDeveloper.url, {
            method: apiEndpoints.auth.authenticateDeveloper.method,
            body: JSON.stringify({
                native: { identifier, password },
            } as AuthenticateDeveloperDtoType['input']),
        });

        const result = (await res.json()) as AuthenticateDeveloperDtoType['output'];
        return result;
    }

    async asAnonymousUser(): Promise<void> {
        await this.fetch(apiEndpoints.auth.logoutDeveloper.url, {
            method: apiEndpoints.auth.logoutDeveloper.method,
        });
        this.authToken = '';
        delete this.headers.Authorization;
    }

    public async fetch(url: string, options: RequestInit = {}): Promise<Response> {
        const headers = { 'Content-Type': 'application/json', ...this.headers, ...options.headers };
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

        return response;
    }
}

export const developerApiClient = new ApiClient(DEVELOPER_API_URL);
