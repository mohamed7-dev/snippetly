import { Card, CardContent } from '@/components/ui/card';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { BookOpenIcon, CodeIcon, GitForkIcon, UserIcon } from 'lucide-react';
import { getDeveloperProfileQueryOptions } from '../../lib/public-profile-query-options';

export function ProfilePageStats() {
    const { id } = useParams({ from: '/(public)/profile/$id' });
    const { data } = useSuspenseQuery(getDeveloperProfileQueryOptions(id));
    const stats =
        'stats' in data
            ? data.stats
            : {
                  snippetsCount: 0,
                  collectionsCount: 0,
                  friendsCount: 0,
                  forkedSnippetsCount: 0,
                  forkedCollectionsCount: 0,
              };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <CodeIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{stats.snippetsCount}</div>
                        <p className="text-xs text-muted-foreground">Snippets</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <BookOpenIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{stats.collectionsCount}</div>
                        <p className="text-xs text-muted-foreground">Collections</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <UserIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{stats.friendsCount}</div>
                        <p className="text-xs text-muted-foreground">Friends</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <GitForkIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{stats.forkedSnippetsCount}</div>
                        <p className="text-xs text-muted-foreground">Forked Snippets</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <GitForkIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="text-2xl font-bold">{stats.forkedCollectionsCount}</div>
                        <p className="text-xs text-muted-foreground">Forked Collections</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
