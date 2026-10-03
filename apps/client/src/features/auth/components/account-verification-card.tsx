import { ProcessStatus } from '@/components/feedback/process-status';
import { PageLoader } from '@/components/views/page-loading-view';
import { developerApiClient } from '@/lib/api-client';
import { apiEndpoints } from '@/lib/api-endpoints';
import { toastApiError } from '@/lib/toast-api-error';
import { type VerifyAccountDtoType } from '@snippetly/common/dto';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import React from 'react';
import { toast } from 'sonner';
import { AuthCard } from './auth-card';

export function AccountVerificationCard() {
    const { token } = useSearch({
        from: '/(auth)/_auth-layout/account-verification',
    });
    const qClient = useQueryClient();

    const { mutateAsync, isPending, data } = useMutation({
        mutationFn: async () => {
            return developerApiClient.fetch<VerifyAccountDtoType['output']>(
                apiEndpoints.auth.verifyAccount.url,
                {
                    method: apiEndpoints.auth.verifyAccount.method,
                    body: JSON.stringify({ token } satisfies VerifyAccountDtoType['input']),
                },
            );
        },
        onSuccess: () => {
            toast.success('Account verified successfully.');
            qClient.invalidateQueries({ queryKey: ['users', 'profiles', 'current'] });
        },
        onError: toastApiError,
    });

    React.useEffect(() => {
        const submit = async () => {
            await mutateAsync();
        };
        if (token && token?.length) {
            submit();
        }
    }, [token]);

    return (
        <AuthCard cardTitle="Email Verification" cardDescription="Verify your email.">
            {isPending && <PageLoader iconProps={{ className: 'size-10' }} />}
            {data && <ProcessStatus title="Success" description="Account verified successfully." />}
        </AuthCard>
    );
}
