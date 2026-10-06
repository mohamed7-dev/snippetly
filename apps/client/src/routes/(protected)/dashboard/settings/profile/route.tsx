import { Page } from '@/components/layout/page';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ProfileSettingsPageAvatar } from '@/features/developer-settings/components/sections/profile-settings-page-avatar';
import { ProfileSettingsPageContentHeader } from '@/features/developer-settings/components/sections/profile-settings-page-content-header';
import { ProfileSettingsPageForm } from '@/features/developer-settings/components/sections/profile-settings-page-form';
import { useUpdateDeveloperProfile } from '@/features/developer-settings/hooks/use-update-developer-profile';
import {
    updateDeveloperProfileInfoFormSchema,
    type UpdateDeveloperProfileInfoFormSchemaType,
} from '@/features/developer-settings/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(protected)/dashboard/settings/profile')({
    component: ProfileSettingsPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Profile Settings',
                },
            ],
        };
    },
});

function ProfileSettingsPage() {
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
        <Page form={form} submitHandler={form.handleSubmit(onSubmit)} entity={user}>
            <div className="flex flex-col gap-6">
                <ProfileSettingsPageContentHeader />
                <div className="space-y-8">
                    <ProfileSettingsPageAvatar />
                    <ProfileSettingsPageForm isPending={isPending} />
                </div>
            </div>
        </Page>
    );
}
