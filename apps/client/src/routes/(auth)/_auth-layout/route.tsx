import { redirectSchema } from '@/lib/zod';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import type z from 'zod';

export const Route = createFileRoute('/(auth)/_auth-layout')({
    component: RouteComponent,
    validateSearch: redirectSchema,
    beforeLoad: async ({ context: { auth }, search, location }) => {
        // If we can't access auth context, do nothing
        if (!auth) return;

        // Allow password reset page even if authenticated
        const isPasswordReset = location.pathname.includes('/password-reset');
        const isAccountVerification = location.pathname.includes('/account-verification');
        console.log({ isAccountVerification, isPasswordReset, isAuth: auth.isAuthenticated });

        if (!isPasswordReset && !isAccountVerification && auth.isAuthenticated) {
            // Already authenticated, redirect away from auth pages
            throw redirect({ to: (search as z.infer<typeof redirectSchema>).redirect || '/dashboard' });
        }
    },
});

function RouteComponent() {
    return (
        <main className="min-h-screen">
            <Outlet />
        </main>
    );
}
