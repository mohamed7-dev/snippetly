import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { BookOpenIcon, GitForkIcon } from 'lucide-react';

export function SnippetsPageStats() {
    const { user } = useAuth();
    const stats = user?.stats ?? {
        snippetsCount: 0,
        collectionsCount: 0,
        friendsCount: 0,
        forkedSnippetsCount: 0,
        forkedCollectionsCount: 0,
        friendsInboxCount: 0,
        friendsOutboxCount: 0,
    };
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Total Snippets</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{stats.snippetsCount}</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <GitForkIcon className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium">Forked Snippets</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{stats.forkedSnippetsCount}</p>
                </CardContent>
            </Card>
        </div>
    );
}
