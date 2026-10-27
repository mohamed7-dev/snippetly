import { StatCard } from '@/components/shared/stat-card';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { BookOpenIcon, CodeIcon, GitForkIcon, UserIcon } from 'lucide-react';
import { getDeveloperProfileQueryOptions } from '../../lib/public-profile-query-options';

export function ProfilePageStats() {
    const { id } = useParams({ from: '/(public)/developers/$id/' });
    const { data } = useSuspenseQuery(getDeveloperProfileQueryOptions(id));
    const stats =
        'stats' in data.activity
            ? data.activity.stats
            : {
                  snippetsCount: 0,
                  collectionsCount: 0,
                  friendsCount: 0,
                  forkedSnippetsCount: 0,
                  forkedCollectionsCount: 0,
              };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <StatCard icon={CodeIcon} value={stats.snippetsCount} label="Snippets" />
            <StatCard icon={BookOpenIcon} value={stats.collectionsCount} label="Collections" />
            <StatCard icon={UserIcon} value={stats.friendsCount} label="Friends" />
            <StatCard
                icon={GitForkIcon}
                value={stats.forkedSnippetsCount}
                label="Forked Snippets"
                variant="secondary"
            />
            <StatCard
                icon={GitForkIcon}
                value={stats.forkedCollectionsCount}
                label="Forked Collections"
                variant="secondary"
            />
        </div>
    );
}
