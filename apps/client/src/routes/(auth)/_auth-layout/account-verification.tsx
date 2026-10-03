import { AccountVerificationCard } from '@/features/auth/components/account-verification-card';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

export const Route = createFileRoute('/(auth)/_auth-layout/account-verification')({
    component: AccountVerificationPage,
    validateSearch: z.object({
        token: z.string().catch(''),
    }),
});

function AccountVerificationPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-1 sm:p-4">
            <AccountVerificationCard />
        </div>
    );
}
