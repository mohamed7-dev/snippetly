import { StatusCard } from '@/components/feedback/status-card';
import { Link } from '@tanstack/react-router';
import { HomeIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '../ui/button';

export function ErrorPageView({
    error,
    reset,
    containerProps,
}: {
    error: Error;
    reset: () => void;
    containerProps?: React.ComponentProps<'div'>;
}) {
    return (
        <StatusCard
            variant="error"
            title="Something went wrong"
            description="We encountered an unexpected error. This has been logged and we'll look into it."
            layout="page"
            containerProps={containerProps}
            actions={
                <>
                    <Button onClick={reset} className="w-full" size="lg">
                        <RefreshCwIcon className="w-4 h-4 mr-2" />
                        Try again
                    </Button>

                    <Button variant="outline" asChild className="w-full bg-transparent" size="lg">
                        <Link to="/">
                            <HomeIcon className="w-4 h-4 mr-2" />
                            Go to Home
                        </Link>
                    </Button>
                </>
            }
            details={
                process.env.NODE_ENV === 'development' ? (
                    <details className="text-left bg-muted p-4 rounded-lg text-sm">
                        <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                        <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                            {error.message}
                        </pre>
                    </details>
                ) : undefined
            }
        />
    );
}
