import { AuthenticateDeveloperDtoType } from '@snippetly/common/dto';
import { SUPER_ADMIN_IDENTIFIER, SUPER_ADMIN_PASSWORD } from '@snippetly/common/lib';
import { AppConfig } from '@snippetly/server';

export class ApiClient {
    private authToken: string;
    private headers: { [key: string]: any } = {};

    constructor(
        private appConfig: Required<AppConfig>,
        private apiUrl: string = '',
    ) {}

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
            await this.fetch(`${this.apiUrl}/auth/sessions/current`, { method: 'delete' });
        }
        const res = await this.fetch(`${this.apiUrl}/auth/sessions`, {
            method: 'POST',
            body: JSON.stringify({
                native: { identifier, password },
            } as AuthenticateDeveloperDtoType['input']),
        });

        const result = (await res.json()) as AuthenticateDeveloperDtoType['output'];
        return result;
    }

    public async asSuperAdmin() {
        const { superAdminCredentials } = this.appConfig.auth;
        await this.asUserWithCredentials(
            superAdminCredentials?.identifier ?? SUPER_ADMIN_IDENTIFIER,
            superAdminCredentials?.password ?? SUPER_ADMIN_PASSWORD,
        );
    }

    /**
     * @description
     * Logs out so that the client is then treated as an anonymous user.
     */
    async asAnonymousUser() {
        await this.fetch(`${this.apiUrl}/auth/sessions/current`, { method: 'delete' });
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
        const authToken = response.headers.get(this.appConfig.auth.authTokenHeaderKey || '');
        if (authToken != null) {
            this.setAuthToken(authToken);
        }

        return response;
    }
}
