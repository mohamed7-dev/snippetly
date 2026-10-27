import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUpdatePassword } from '../../hooks/use-update-password';
import { updatePasswordFormSchema, type UpdatePasswordFormSchemaType } from '../../lib/schema';
import { UpdatePasswordForm } from '../forms/update-password-form';

export function SecuritySettingsPagePassword() {
    const form = useForm<UpdatePasswordFormSchemaType>({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
        },
        resolver: zodResolver(updatePasswordFormSchema),
    });

    const { mutateAsync, isPending } = useUpdatePassword();

    const onSubmit = async (values: UpdatePasswordFormSchemaType) => {
        await mutateAsync({ newPassword: values.newPassword, currentPassword: values.currentPassword });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h2>Password</h2>
                </CardTitle>
                <CardDescription>
                    <p>Change your password to help protect your account.</p>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <UpdatePasswordForm isPending={isPending} />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
