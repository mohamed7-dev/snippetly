import { Card, CardContent } from '@/components/ui/card';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { Permission } from '@snippetly/common/dto';
import { useSuspenseQuery } from '@tanstack/react-query';
import { BookOpenIcon, Code2Icon, GitForkIcon } from 'lucide-react';

export function CollectionsPageStats() {
    const { data } = useSuspenseQuery(getCurrentDeveloperActivityStats());
    const stats = data ?? {
        snippetsCount: 0,
        collectionsCount: 0,
        friendsCount: 0,
        forkedSnippetsCount: 0,
        forkedCollectionsCount: 0,
        friendsInboxCount: 0,
        friendsOutboxCount: 0,
    };
    return (
        <PermissionGuard
            requiredPermissions={[Permission.Authenticated, Permission.Owner, Permission.ReadDeveloper]}
            ownerId={data?.id}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <BookOpenIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Total Collections</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">{stats.collectionsCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Code2Icon className="h-4 w-4 text-secondary" />
                            <span className="text-sm font-medium">Total Snippets</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">{stats.snippetsCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <GitForkIcon className="h-4 w-4 text-accent" />
                            <span className="text-sm font-medium">Forked Collections</span>
                        </div>
                        <p className="text-2xl font-bold mt-1">{stats.forkedCollectionsCount}</p>
                    </CardContent>
                </Card>
            </div>
        </PermissionGuard>
    );
}
