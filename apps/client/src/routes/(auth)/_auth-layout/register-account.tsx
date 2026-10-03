import { AccountRegistrationCard } from '@/features/auth/components/account-registration-card';
import { redirectSchema } from '@/lib/zod';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/_auth-layout/register-account')({
    component: RegisterAccountPage,
    validateSearch: redirectSchema,
});

function RegisterAccountPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-1 sm:p-4">
            <AccountRegistrationCard />
        </div>
    );
}
