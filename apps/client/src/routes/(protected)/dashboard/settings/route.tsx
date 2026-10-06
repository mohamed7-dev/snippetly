import { SettingsLayoutDesktopSidebar } from '@/features/app-shell/components/settings/settings-layout-desktop-sidebar';
import { SettingsLayoutHeader } from '@/features/app-shell/components/settings/settings-layout-header';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/(protected)/dashboard/settings')({
    component: SettingsLayout,
});

function SettingsLayout() {
    return (
        <React.Fragment>
            <SettingsLayoutHeader />
            <div className="flex gap-16 px-4 mt-8">
                <SettingsLayoutDesktopSidebar />
                <main className="container flex-1 max-w-3xl">
                    <Outlet />
                </main>
            </div>
        </React.Fragment>
    );
}
