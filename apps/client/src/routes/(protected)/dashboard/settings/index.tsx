import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { GeneralSettingsPageAppInstallation } from '@/features/developer-settings/components/sections/general-settings-page-app-installation';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/settings/')({
    component: GeneralSettingsPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'General Settings',
                },
            ],
        };
    },
});

function GeneralSettingsPage() {
    return (
        <Page>
            <PageTitle>General settings</PageTitle>
            <PageDescription>
                Manage the app installation and offline features for this device.
            </PageDescription>
            <GeneralSettingsPageAppInstallation />
        </Page>
    );
}
