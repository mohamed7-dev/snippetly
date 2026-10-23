import { StatCard } from '@/components/shared/stat-card';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { Permission } from '@snippetly/common/dto';
import { useSuspenseQuery } from '@tanstack/react-query';
import { BookOpenIcon, GitForkIcon } from 'lucide-react';

export function CollectionsPageStats() {
    const { data } = useSuspenseQuery(getCurrentDeveloperActivityStats());
    const stats = data?.stats ?? {
        collectionsCount: 0,
        forkedCollectionsCount: 0,
    };
    return (
        <PermissionGuard
            requiredPermissions={[Permission.Authenticated, Permission.ReadDeveloper]}
            isAvailableOffline={true}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <StatCard icon={BookOpenIcon} value={stats.collectionsCount} label="Total Collections" />
                <StatCard
                    icon={GitForkIcon}
                    value={stats.forkedCollectionsCount}
                    label="Forked Collections"
                    variant="secondary"
                />
            </div>
        </PermissionGuard>
    );
}
