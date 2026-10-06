import { SecuritySettingsPageAccountDeletion } from '@/features/developer-settings/components/sections/security-settings-page-account-deletion';
import { SecuritySettingsPageContentHeader } from '@/features/developer-settings/components/sections/security-settings-page-content-header';
import { SecuritySettingsPageEmail } from '@/features/developer-settings/components/sections/security-settings-page-email';
import { SecuritySettingsPageEmailChange } from '@/features/developer-settings/components/sections/security-settings-page-email-change';
import { SecuritySettingsPagePassword } from '@/features/developer-settings/components/sections/security-settings-page-password';
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
    return (
        <div className="flex flex-col gap-6">
            <SecuritySettingsPageContentHeader />
            <SecuritySettingsPageEmail />
            <SecuritySettingsPageEmailChange />
            <SecuritySettingsPagePassword />
            <SecuritySettingsPageAccountDeletion />
        </div>
    );
}
