import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { redirect } from '@tanstack/react-router';
import { UserRoundIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUpdateDeveloperProfile } from '../../hooks/use-update-developer-profile';
import {
    updateDeveloperProfileInfoFormSchema,
    type UpdateDeveloperProfileInfoFormSchemaType,
} from '../../lib/schema';
import { UpdateDeveloperProfileForm } from '../forms/update-developer-profile-form';

export function ProfileSettings() {
    const { user, refreshActiveUser } = useAuth();
    if (!user) {
        throw redirect({ to: '/sign-in' });
    }
    const form = useForm<UpdateDeveloperProfileInfoFormSchemaType>({
        defaultValues: user,
        resolver: zodResolver(updateDeveloperProfileInfoFormSchema),
    });

    const { mutateAsync, isPending } = useUpdateDeveloperProfile({
        onSuccess: () => {
            refreshActiveUser();
        },
    });

    const onSubmit = async (values: UpdateDeveloperProfileInfoFormSchemaType) => {
        mutateAsync({
            firstName: values.firstName,
            lastName: values.lastName,
            bio: values.bio,
            isPrivate: values.isPrivate,
        });
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserRoundIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h2>Profile Information</h2>
                </CardTitle>
                <CardDescription>
                    <p>Update your name, bio, and profile visibility.</p>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(values => onSubmit(values))}>
                        <UpdateDeveloperProfileForm isPending={isPending} />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
