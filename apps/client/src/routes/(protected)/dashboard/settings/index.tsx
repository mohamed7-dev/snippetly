import { InstallAppButton } from '@/components/inputs/install-app-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DownloadIcon, WifiOffIcon, ZapIcon } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(protected)/dashboard/settings/')({
    component: InstallSettingsPage,
    head: () => {
        return {
            meta: [
                {
                    title: 'Install Snippetly',
                },
            ],
        };
    },
});

function InstallSettingsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Install Snippetly</h2>
                <p className="text-muted-foreground">
                    Keep your code library close at hand, even when you are offline.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Take your snippets with you</CardTitle>
                    <CardDescription>
                        Install Snippetly for a convenient, app-like experience on your device.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                    <ul className="flex flex-col gap-4">
                        <li className="flex items-start gap-3">
                            <WifiOffIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                            <span>
                                The app shell and its resources are cached, so Snippetly can open
                                when you do not have an internet connection.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <DownloadIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                            <span>Launch Snippetly directly from your home screen or app launcher.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <ZapIcon className="mt-0.5 size-5 shrink-0 text-primary" />
                            <span>
                                Open the familiar Snippetly experience in its own app window.
                            </span>
                        </li>
                    </ul>
                    <p className="text-sm text-muted-foreground">
                        Features that need your account or the server still require an internet
                        connection.
                    </p>
                    <div>
                        <InstallAppButton />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
