import { Page } from '@/components/layout/page';
import { Button } from '@/components/ui/button';
import { PasswordResetCard } from '@/features/auth/components/sections/password-reset-card';
import { useResetPassword } from '@/features/auth/hooks/use-reset-password';
import { resetPasswordFormSchema, type ResetPasswordFormSchema } from '@/features/auth/lib/schema';
import { formatApiError } from '@/lib/format-api-error';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

export const Route = createFileRoute('/(auth)/_auth-layout/password-reset')({
    component: PasswordResetPage,
    validateSearch: z.object({
        token: z.string().catch(''),
    }),
});

function PasswordResetPage() {
    const { token } = Route.useSearch();
    const form = useForm<ResetPasswordFormSchema>({
        defaultValues: {
            newPassword: '',
            token: token ?? '',
        },
        resolver: zodResolver(resetPasswordFormSchema),
    });
    const [errorMessage, setErrorMessage] = React.useState<undefined | string>(undefined);

    const { mutateAsync, isPending, data } = useResetPassword({
        onSuccess: () => {
            form.reset();
        },
        onError: e => {
            const formattedError = formatApiError(e);
            setErrorMessage(formattedError.title);
        },
    });

    return (
        <Page form={form} submitHandler={form.handleSubmit(async values => await mutateAsync(values))}>
            <div className="min-h-screen flex items-center justify-center p-1">
                <PasswordResetCard
                    isPending={isPending}
                    successMessage={
                        data ? (
                            <div className="space-y-2">
                                <p>
                                    The password was reset successfully. now, you can sign-in with the new
                                    password.
                                </p>
                                <Button variant={'outline'} asChild>
                                    <Link to="/sign-in">Sign in</Link>
                                </Button>
                            </div>
                        ) : undefined
                    }
                    errorMessage={errorMessage}
                />
            </div>
        </Page>
    );
}
