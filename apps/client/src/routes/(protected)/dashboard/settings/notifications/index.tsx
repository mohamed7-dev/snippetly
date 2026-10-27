import { Page, PageDescription, PageTitle } from '@/components/layout/page';
import { NotificationsSettingsPageInApp } from '@/features/developer-settings/components/sections/notifications-settings-page-in-app';
import { PushNotificationSettings } from '@/features/push-notifications/components/sections/push-notification-settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/settings/notifications/')({
    component: NotificationsSettingsPage,
    head: () => ({
        meta: [{ title: 'Notification Settings' }],
    }),
});

function NotificationsSettingsPage() {
    return (
        <Page>
            <PageTitle>Notifications</PageTitle>
            <PageDescription>
                Choose whether to receive in-app alerts and browser push notifications for activity.
            </PageDescription>
            <NotificationsSettingsPageInApp />
            <PushNotificationSettings />
        </Page>
    );
}
