import { AccountVerificationCard } from '@/features/auth/components/sections/account-verification-card';
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
        <div className="flex items-center justify-center px-2 pt-4">
            <AccountVerificationCard />
        </div>
    );
}
