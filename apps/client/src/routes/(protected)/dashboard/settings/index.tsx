import { GeneralSettingsPageAppInstallation } from '@/features/developer-settings/components/sections/general-settings-page-app-installation';
import { GeneralSettingsPageHeader } from '@/features/developer-settings/components/sections/general-settings-page-header';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/settings/')({
    component: GeneralSettingsPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Settings',
                },
            ],
        };
    },
});

function GeneralSettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <GeneralSettingsPageHeader />
            <GeneralSettingsPageAppInstallation />
        </div>
    );
}
