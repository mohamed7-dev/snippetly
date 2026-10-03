import { SignInCard } from '@/features/auth/components/sign-in-card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { createFileRoute, useRouterState } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)/_auth-layout/sign-in')({
    component: DeveloperAuthenticationPage,
});

function DeveloperAuthenticationPage() {
    const auth = useAuth();
    const isLoading = useRouterState({
        select: s => s.isLoading,
    });

    const isVerifying = isLoading || auth.status === 'verifying';

    return (
        <div className="min-h-screen flex items-center justify-center p-1 sm:p-4">
            <SignInCard userType="developer" isVerifying={isVerifying} />
        </div>
    );
}
