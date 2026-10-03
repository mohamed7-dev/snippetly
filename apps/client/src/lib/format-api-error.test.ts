import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from './api-client';
import { formatApiError } from './format-api-error';

describe('formatApiError', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('formats server field errors for display', () => {
        const error = new ApiClientError(new Response(null, { status: 400 }), {
            code: 'USER_INPUT_ERROR',
            httpStatusCode: 400,
            message: 'Some fields need attention',
            fields: {
                'native.identifier': 'Invalid email address',
                firstName: 'Required',
            },
        });

        expect(formatApiError(error)).toEqual({
            title: 'Some fields need attention',
            description: 'Native / identifier: Invalid email address; First name: Required',
        });
    });

    it('falls back to a regular Error message', () => {
        expect(formatApiError(new Error('Network unavailable'))).toEqual({
            title: 'Network unavailable',
        });
    });
});