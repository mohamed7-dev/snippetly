import { InstallAppButton } from '@/components/inputs/install-app-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudUploadIcon, DownloadIcon, WifiOffIcon } from 'lucide-react';

export function GeneralSettingsPageAppInstallation() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Install Snippetly on this device</CardTitle>
                <CardDescription>
                    Add Snippetly to your device for a standalone app experience and access to supported
                    offline features.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                <ul className="flex flex-col gap-4">
                    <li className="flex items-start gap-3">
                        <WifiOffIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span>
                            The app shell is cached, so Snippetly can reopen while offline. Previously visited
                            dashboard data and saved snippets may also be available from this device.
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CloudUploadIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span>
                            While offline, create snippets and collections on this device. They are queued and
                            synced when the connection returns.
                        </span>
                    </li>
                    <li className="flex items-start gap-3">
                        <DownloadIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span>
                            Launch Snippetly from your home screen or app launcher when installation is
                            supported.
                        </span>
                    </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                    Offline access is limited to cached data and supported create actions. Other features
                    require an internet connection.
                </p>
                <div>
                    <InstallAppButton />
                </div>
            </CardContent>
        </Card>
    );
}
