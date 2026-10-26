import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { AppearanceSettingsPageCodeEditor } from '@/features/developer-settings/components/sections/appearance-settings-page-code-editor';
import { AppearanceSettingsPageThemeSettings } from '@/features/developer-settings/components/sections/appearance-settings-page-theme';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/settings/appearance/')({
    component: AppearanceSettingsPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Appearance Settings',
                },
            ],
        };
    },
});

function AppearanceSettingsPage() {
    return (
        <Page>
            <PageTitle>Appearance</PageTitle>
            <PageDescription>
                Choose your Snippetly color theme and customize how code appears in the editor.
            </PageDescription>
            <AppearanceSettingsPageThemeSettings />
            <AppearanceSettingsPageCodeEditor />
        </Page>
    );
}
