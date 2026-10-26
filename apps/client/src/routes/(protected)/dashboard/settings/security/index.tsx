import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { SecuritySettingsPagePassword } from '@/features/developer-settings/components/sections/security-settings-page-password';
import { SecuritySettingsPageSessions } from '@/features/developer-settings/components/sections/security-settings-page-sessions';
import { Permission } from '@snippetly/common/dto';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/settings/security/')({
    component: SecurityPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Security Settings',
                },
            ],
        };
    },
});

function SecurityPage() {
    const { user } = useAuth();
    return (
        <Page>
            <PageTitle>Security</PageTitle>
            <PageDescription>
                Change your password and review or sign out of devices using your account.
            </PageDescription>

            <PermissionGuard
                requiredPermissions={[Permission.Authenticated, Permission.Owner, Permission.UpdateDeveloper]}
                ownerId={user?.id}
            >
                <SecuritySettingsPagePassword />
                <SecuritySettingsPageSessions />
            </PermissionGuard>
        </Page>
    );
}
