import { Page } from '@/components/layout/page';
import { ForgotPasswordCard } from '@/features/auth/components/sections/forgot-password-card';
import { useRequestPasswordReset } from '@/features/auth/hooks/use-request-password-reset';
import {
    passwordResetRequestFormSchema,
    type PasswordResetRequestFormSchema,
} from '@/features/auth/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(auth)/_auth-layout/forgot-password')({
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    const form = useForm<PasswordResetRequestFormSchema>({
        defaultValues: {
            emailAddress: '',
        },
        resolver: zodResolver(passwordResetRequestFormSchema),
    });

    const { mutateAsync, isPending, data, error } = useRequestPasswordReset();

    return (
        <Page form={form} submitHandler={form.handleSubmit(async values => await mutateAsync(values))}>
            <div className="min-h-screen flex items-center justify-center p-1 sm:p-4">
                <ForgotPasswordCard
                    isPending={isPending}
                    successMessage={
                        data?.success
                            ? 'The password reset flow started, Follow the link sent to your email address to complete the reset flow.'
                            : undefined
                    }
                    errorMessage={error ? error.message : undefined}
                />
            </div>
        </Page>
    );
}
