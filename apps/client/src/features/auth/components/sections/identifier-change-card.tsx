import { ProcessStatus } from '@/components/feedback/process-status';
import { SectionLoader } from '@/components/feedback/section-loader';
import { useSearch } from '@tanstack/react-router';
import React from 'react';
import { useAuth } from '../../hooks/use-auth';
import { useChangeIdentifier } from '../../hooks/use-change-identifier';
import { AuthCard } from '../shared/auth-card';

export function IdentifierChangeCard() {
    const { token } = useSearch({
        from: '/(auth)/_auth-layout/identifier-change',
    });
    const { refreshActiveUser } = useAuth();
    const {
        mutateAsync: changeIdentifier,
        isPending,
        data,
    } = useChangeIdentifier({
        onSuccess: () => {
            refreshActiveUser();
        },
    });

    React.useEffect(() => {
        const verify = async () => {
            await changeIdentifier({ token });
        };

        if (token && token?.length) {
            verify();
        }
    }, [token]);

    return (
        <AuthCard cardTitle="Email Address Change" cardDescription="Email address change token verification.">
            {isPending && <SectionLoader message="Verifying token..." />}
            <div className="p-2">
                {data && (
                    <ProcessStatus
                        title="Success"
                        description="Email address was changed successfully."
                        showCloseButton={false}
                    />
                )}
            </div>
        </AuthCard>
    );
}
