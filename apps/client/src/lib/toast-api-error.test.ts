import { afterEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { toastApiError } from './toast-api-error';

describe('toastApiError', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows the formatted message and field details in an error toast', () => {
        const toastError = vi.spyOn(toast, 'error').mockImplementation(() => '' as never);

        toastApiError({
            message: 'Some fields need attention',
            fields: { emailAddress: 'Invalid email address' },
        });

        expect(toastError).toHaveBeenCalledWith('Some fields need attention', {
            description: 'Email address: Invalid email address',
        });
    });
});