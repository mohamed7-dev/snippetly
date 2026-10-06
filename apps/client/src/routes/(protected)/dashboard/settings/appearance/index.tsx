import { AppearanceSettingsPageContentHeader } from '@/features/developer-settings/components/sections/appearance-settings-page-content-header';
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
        <div className="flex flex-col gap-6">
            <AppearanceSettingsPageContentHeader />
            <AppearanceSettingsPageThemeSettings />
        </div>
    );
}
