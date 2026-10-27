import { Page } from '@/components/layout/page';
import { SignInCard } from '@/features/auth/components/sections/sign-in-card';
import { useAuthenticateDeveloper } from '@/features/auth/hooks/use-authenticate-developer';
import {
    developerAuthenticationFormSchema,
    type DeveloperAuthenticationFormSchema,
} from '@/features/auth/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(auth)/_auth-layout/sign-in')({
    component: DeveloperAuthenticationPage,
});

function DeveloperAuthenticationPage() {
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
        onSuccess: async () => {
            form.reset();

            if (!from) {
                await navigate({
                    to: '/dashboard',
                    replace: true,
                });
            } else {
                await navigate({
                    href: from,
                    replace: true,
                });
            }
        },
    });

    return (
        <Page form={form} submitHandler={form.handleSubmit(values => mutateAsync(values))}>
            <div className="flex items-center justify-center px-2 pt-4">
                <SignInCard isPending={isPending} userType="developer" />
            </div>
        </Page>
    );
}
