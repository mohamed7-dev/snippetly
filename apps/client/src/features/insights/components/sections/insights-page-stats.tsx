import { StatCard } from '@/components/shared/stat-card';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { Permission } from '@snippetly/common/dto';
import { useSuspenseQuery } from '@tanstack/react-query';
import { BookOpenIcon, Code2Icon, StarIcon, UsersIcon } from 'lucide-react';

export function InsightsPageStats() {
    const { data } = useSuspenseQuery(getCurrentDeveloperActivityStats());
    const stats = data?.stats ?? {
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
            requiredPermissions={[Permission.Authenticated, Permission.ReadDeveloper]}
            isAvailableOffline={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Code2Icon} value={stats.snippetsCount} label="Total Snippets" />
                <StatCard
                    icon={BookOpenIcon}
                    value={stats.collectionsCount}
                    label="Collections"
                    variant="secondary"
                />
                <StatCard
                    icon={StarIcon}
                    value={stats.friendsInboxCount}
                    label="Friendship Requests"
                    variant="accent"
                />
                <StatCard icon={UsersIcon} value={stats.friendsCount} label="Friends" />
            </div>
        </PermissionGuard>
    );
}
