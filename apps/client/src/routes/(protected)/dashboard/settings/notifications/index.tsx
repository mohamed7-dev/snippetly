import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useDeveloperSettings } from '@/features/developer-settings/hooks/use-developer-settings';
import { PushNotificationSettings } from '@/features/push-notifications/components/sections/push-notification-settings';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/settings/notifications/')({
    component: NotificationsSettingsPage,
    head: () => ({
        meta: [{ title: 'Notification Settings' }],
    }),
});

function NotificationsSettingsPage() {
    const {
        state: { settings, isLoaded },
        actions: { setInAppNotificationsEnabled },
    } = useDeveloperSettings();

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
                <p className="text-muted-foreground">
                    Choose how Snippetly notifies you. In-app and push notifications are controlled
                    separately.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>In-app notifications</CardTitle>
                    <CardDescription>
                        Show alerts such as offline status, pending syncs, and welcome messages in the app.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium">Allow in-app notifications</p>
                            <p className="text-sm text-muted-foreground">
                                Turn off to stop checking and showing in-app alerts.
                            </p>
                        </div>
                        <Switch
                            aria-label="Enable in-app notifications"
                            checked={settings.inAppNotificationsEnabled}
                            disabled={!isLoaded}
                            onCheckedChange={setInAppNotificationsEnabled}
                        />
                    </div>
                </CardContent>
            </Card>

            <PushNotificationSettings />
        </div>
    );
}
