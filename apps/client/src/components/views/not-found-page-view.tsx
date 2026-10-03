import { StatusCard } from '@/components/feedback/status-card';
import { Link } from '@tanstack/react-router';
import { HomeIcon, SearchIcon } from 'lucide-react';
import { Button } from '../ui/button';

export type NotFoundMetaData = {
    title?: string;
    description?: string;
};

export function NotFoundPageView({ title, description }: NotFoundMetaData) {
    return (
        <StatusCard
            variant="not-found"
            title={title ?? 'Page not found'}
            description={description ?? "The page you're looking for doesn't exist or has been moved."}
            layout="page"
            actions={
                <>
                    <Button asChild className="w-full" size="lg">
                        <Link to="/dashboard">
                            <HomeIcon className="w-4 h-4 mr-2" />
                            Go to Dashboard
                        </Link>
                    </Button>

                    <Button variant="outline" asChild className="w-full bg-transparent" size="lg">
                        <Link to="/dashboard/discover">
                            <SearchIcon className="w-4 h-4 mr-2" />
                            Discover Snippets
                        </Link>
                    </Button>
                </>
            }
            details={
                <div className="text-sm text-muted-foreground">
                    <p>Looking for something specific?</p>
                    <div className="flex justify-center space-x-4 mt-2">
                        <Link to="/dashboard/snippets/new" className="text-primary hover:underline">
                            Create Snippet
                        </Link>
                        <Link to="/dashboard/collections" className="text-primary hover:underline">
                            Browse Collections
                        </Link>
                        <Link to="/dashboard/friends" className="text-primary hover:underline">
                            Find Friends
                        </Link>
                    </div>
                </div>
            }
        />
    );
}
