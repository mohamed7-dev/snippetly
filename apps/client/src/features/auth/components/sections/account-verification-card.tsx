import { ProcessStatus } from '@/components/feedback/process-status';
import { PageLoader } from '@/components/views/page-loading-view';
import { useSearch } from '@tanstack/react-router';
import React from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useVerifyAccount } from '../../hooks/use-verify-account';
import { AuthCard } from '../shared/auth-card';

export function AccountVerificationCard() {
    const { token } = useSearch({
        from: '/(auth)/_auth-layout/account-verification',
    });
    const { refreshActiveUser } = useAuth();
    const {
        mutateAsync: verifyAccount,
        isPending,
        data,
    } = useVerifyAccount({
        onSuccess: () => {
            refreshActiveUser();
        },
    });

    React.useEffect(() => {
        const verify = async () => {
            await verifyAccount({ token });
        };

        if (token && token?.length) {
            verify();
        }
    }, [token]);

    return (
        <AuthCard cardTitle="Email Verification" cardDescription="Verify your email.">
            {isPending && <PageLoader iconProps={{ className: 'size-10' }} />}
            {data && <ProcessStatus title="Success" description="Account verified successfully." />}
        </AuthCard>
    );
}
