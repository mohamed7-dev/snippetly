import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AccountDeletionSettings } from '@/features/developer-settings/components/sections/account-deletion-settings';
import { AccountEmailAddressChange } from '@/features/developer-settings/components/sections/account-email-address-change';
import { AccountEmailAddressSettings } from '@/features/developer-settings/components/sections/account-email-address-settings';
import { AccountImageSettings } from '@/features/developer-settings/components/sections/account-image-settings';
import { ProfileSettings } from '@/features/developer-settings/components/sections/profile-settings';
import { Permission } from '@snippetly/common/dto';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/settings/account/')({
    component: AccountSettingsPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Account Settings',
                },
            ],
        };
    },
});

function AccountSettingsPage() {
    const { user } = useAuth();
    if (!user) {
        throw redirect({ to: '/sign-in' });
    }

    return (
        <Page entity={user}>
            <PageTitle>Account settings</PageTitle>
            <PageDescription>
                Update your profile and email address, or schedule account deletion.
            </PageDescription>
            <div className="flex flex-col gap-6">
                <PermissionGuard
                    requiredPermissions={[
                        Permission.Authenticated,
                        Permission.Owner,
                        Permission.UpdateDeveloper,
                    ]}
                    ownerId={user.id}
                >
                    <AccountImageSettings />
                    <ProfileSettings />
                    <AccountEmailAddressSettings />
                    <AccountEmailAddressChange />
                    <AccountDeletionSettings />
                </PermissionGuard>
            </div>
        </Page>
    );
}
