import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClient, ApiClientError } from './api-client';

describe('ApiClient', () => {
    beforeEach(() => {
        const storage = new Map<string, string>();
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => storage.get(key) ?? null,
            setItem: (key: string, value: string) => storage.set(key, value),
            removeItem: (key: string) => storage.delete(key),
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('throws a typed error for non-success HTTP responses', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(
                new Response(
                    JSON.stringify({
                        code: 'FORBIDDEN_ERROR',
                        httpStatusCode: 403,
                        message: 'Access denied',
                    }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } },
                ),
            ),
        );

        const client = new ApiClient('https://api.example.test');

        await expect(client.fetch('/private')).rejects.toMatchObject({
            name: 'ApiClientError',
            code: 'FORBIDDEN_ERROR',
            httpStatusCode: 403,
            message: 'Access denied',
        } satisfies Partial<ApiClientError>);
    });

    it('throws for error DTOs returned with a successful HTTP status', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(
                new Response(
                    JSON.stringify({
                        code: 'INVALID_CREDENTIALS_ERROR',
                        httpStatusCode: 401,
                        message: 'Invalid credentials',
                    }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } },
                ),
            ),
        );

        const client = new ApiClient('https://api.example.test');

        await expect(client.fetch('/login')).rejects.toMatchObject({
            name: 'ApiClientError',
            code: 'INVALID_CREDENTIALS_ERROR',
            httpStatusCode: 401,
            message: 'Invalid credentials',
        } satisfies Partial<ApiClientError>);
    });

    it('returns parsed successful payloads', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(
                new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }),
            ),
        );

        const client = new ApiClient('https://api.example.test');
        const result = await client.fetch<{ success: boolean }>('/register');

        expect(result).toEqual({ success: true });
    });
});
