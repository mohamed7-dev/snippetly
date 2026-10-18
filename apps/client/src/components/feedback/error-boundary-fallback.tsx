import { isOfflineNetworkError } from '@/lib/api-client';
import { Link } from '@tanstack/react-router';
import { HomeIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { StatusCard } from './status-card';

export function ErrorBoundaryFallback({ error }: { error?: Error }) {
    const isOffline =
        isOfflineNetworkError(error) || (typeof navigator !== 'undefined' && !navigator.onLine);
    return (
        <StatusCard
            variant="error"
            title={isOffline ? 'Unavailable offline' : 'Something went wrong'}
            description={
                isOffline
                    ? 'This data is not cached on this device. Reconnect to the internet and visit this section to make it available offline.'
                    : "We encountered an unexpected error. This has been logged and we'll look into it."
            }
            layout="section"
            actions={
                <Button variant="outline" asChild className="w-full bg-transparent" size="lg">
                    <Link to="/">
                        <HomeIcon className="w-4 h-4 mr-2" />
                        Go to Home
                    </Link>
                </Button>
            }
        />
    );
}
