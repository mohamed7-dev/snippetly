import { ForgotPasswordCard } from '@/features/auth/components/forgot-password-card';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/_auth-layout/forgot-password')({
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-1 sm:p-4">
            <ForgotPasswordCard />
        </div>
    );
}
