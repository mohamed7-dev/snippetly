import { SettingsLayoutDesktopSidebar } from '@/features/app-shell/components/settings/settings-layout-desktop-sidebar';
import { SettingsLayoutHeader } from '@/features/app-shell/components/settings/settings-layout-header';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/settings')({
    component: SettingsLayout,
});

function SettingsLayout() {
    return (
        <div>
            <SettingsLayoutHeader />
            <div className="flex lg:gap-16 mt-4">
                <SettingsLayoutDesktopSidebar />
                <main className="container flex-1 lg:max-w-3xl px-3 md:px-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
