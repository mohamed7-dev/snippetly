import { Page } from '@/components/layout/page';
import { SignInCard } from '@/features/auth/components/sections/sign-in-card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAuthenticateDeveloper } from '@/features/auth/hooks/use-authenticate-developer';
import {
    developerAuthenticationFormSchema,
    type DeveloperAuthenticationFormSchema,
} from '@/features/auth/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useRouterState } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(auth)/_auth-layout/sign-in')({
    component: DeveloperAuthenticationPage,
});

function DeveloperAuthenticationPage() {
    const auth = useAuth();
    const isLoading = useRouterState({
        select: s => s.isLoading,
    });
    const navigate = Route.useNavigate();
    const { redirect: from } = Route.useSearch();

    const form = useForm<DeveloperAuthenticationFormSchema>({
        defaultValues: {
            native: {
                identifier: '',
                password: '',
                rememberMe: false,
            },
        },
        resolver: zodResolver(developerAuthenticationFormSchema),
    });

    const { mutateAsync, isPending } = useAuthenticateDeveloper({
        onSuccess: () => {
            form.reset();

            if (!from) {
                navigate({
                    to: '/dashboard',
                    replace: true,
                });
            } else {
                navigate({
                    href: from,
                    replace: true,
                });
            }
        },
    });

    const isVerifying = isLoading || auth.status === 'verifying';

    return (
        <Page form={form} submitHandler={form.handleSubmit(values => mutateAsync(values))}>
            <div className="min-h-screen flex items-center justify-center p-1 sm:p-4">
                <SignInCard isPending={isPending} userType="developer" isVerifying={isVerifying} />
            </div>
        </Page>
    );
}
