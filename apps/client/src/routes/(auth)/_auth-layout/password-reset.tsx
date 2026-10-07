import { Page } from '@/components/layout/page';
import { PasswordResetCard } from '@/features/auth/components/sections/password-reset-card';
import { useResetPassword } from '@/features/auth/hooks/use-reset-password';
import { resetPasswordFormSchema, type ResetPasswordFormSchema } from '@/features/auth/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
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

    const { mutateAsync, isPending } = useResetPassword();

    return (
        <Page form={form} submitHandler={form.handleSubmit(async values => await mutateAsync(values))}>
            <div className="min-h-screen flex items-center justify-center p-1 sm:p-4">
                <PasswordResetCard isPending={isPending} />
            </div>
        </Page>
    );
}
