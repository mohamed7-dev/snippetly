import { StatCard } from '@/components/shared/stat-card';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { getCurrentDeveloperActivityStats } from '@/features/stats/lib/stats-query-options';
import { Permission } from '@snippetly/common/dto';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ClockIcon, MailIcon, UsersIcon } from 'lucide-react';

export function RequestsPageStats() {
    const { data } = useSuspenseQuery(getCurrentDeveloperActivityStats());
    const stats = data?.stats ?? {
        friendsInboxCount: 0,
        friendsOutboxCount: 0,
        friendsCount: 0,
    };
    return (
        <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.ReadDeveloper]}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard icon={MailIcon} value={stats.friendsInboxCount} label="Incoming Requests" />
                <StatCard
                    icon={ClockIcon}
                    value={stats.friendsOutboxCount}
                    label="Sent Requests"
                    variant="secondary"
                />
                <StatCard
                    icon={UsersIcon}
                    value={stats.friendsCount}
                    label="Total Friends"
                    variant="secondary"
                />
            </div>
        </PermissionGuard>
    );
}
