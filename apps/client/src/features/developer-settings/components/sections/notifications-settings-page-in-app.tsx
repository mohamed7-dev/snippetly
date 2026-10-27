import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { BellIcon } from 'lucide-react';
import { useDeveloperSettings } from '../../hooks/use-developer-settings';

export function NotificationsSettingsPageInApp() {
    const {
        state: { settings, isLoaded },
        actions: { setInAppNotificationsEnabled },
    } = useDeveloperSettings();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BellIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h2>In-app notifications</h2>
                </CardTitle>
                <CardDescription>
                    <p>Show alerts such as offline status, pending syncs, and welcome messages in the app.</p>
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
    );
}
