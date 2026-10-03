import { PasswordResetCard } from '@/features/auth/components/password-reset-card';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

export const Route = createFileRoute('/(auth)/_auth-layout/password-reset')({
    component: PasswordResetPage,
    validateSearch: z.object({
        token: z.string().catch(''),
    }),
});

function PasswordResetPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-1 sm:p-4">
            <PasswordResetCard />
        </div>
    );
}
