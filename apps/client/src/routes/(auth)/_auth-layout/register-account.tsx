import { Page } from '@/components/layout/page';
import { AccountRegistrationCard } from '@/features/auth/components/sections/account-registration-card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRegisterDeveloperAccount } from '@/features/auth/hooks/use-register-developer-account';
import {
    accountRegistrationFormSchema,
    type AccountRegistrationFormSchema,
} from '@/features/auth/lib/schema';
import { redirectSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(auth)/_auth-layout/register-account')({
    component: RegisterAccountPage,
    validateSearch: redirectSchema,
});

function RegisterAccountPage() {
    const { login } = useAuth();
    const navigate = Route.useNavigate();
    const { redirect: from } = Route.useSearch();

    const form = useForm<AccountRegistrationFormSchema>({
        defaultValues: {
            firstName: '',
            lastName: '',
            emailAddress: '',
            password: '',
            isPrivate: false,
        },
        resolver: zodResolver(accountRegistrationFormSchema),
    });

    const { mutateAsync, isPending } = useRegisterDeveloperAccount({
        onSuccess: async (_data, variables) => {
            form.reset();
            if (variables?.emailAddress && variables.password) {
                await login(
                    {
                        native: { identifier: variables.emailAddress, password: variables.password },
                    },
                    'developer',
                    () => {
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
                );
            } else {
                navigate({
                    to: '/sign-in',
                    replace: true,
                });
            }
        },
    });
    return (
        <Page form={form} submitHandler={form.handleSubmit(async values => await mutateAsync(values))}>
            <div className="min-h-screen flex items-center justify-center p-1 sm:p-4">
                <AccountRegistrationCard isPending={isPending} />
            </div>
        </Page>
    );
}
