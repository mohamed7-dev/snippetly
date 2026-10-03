import { Link } from '@tanstack/react-router';
import { HomeIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { StatusCard } from './status-card';

export function ErrorBoundaryFallback() {
    return (
        <StatusCard
            variant="error"
            title="Something went wrong"
            description="We encountered an unexpected error. This has been logged and we'll look into it."
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
