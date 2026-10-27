import { DeveloperIdentity } from '@/components/shared/developer-identity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OnlineGuard } from '@/features/offline-snippet/components/shared/online-guard';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { GlobeIcon, LockIcon } from 'lucide-react';
import { getSnippetQueryOptions } from '../../lib/snippet-query-options';
import { SnippetActionsDropdown } from '../shared/snippet-actions-dropdown';

export function SnippetPageContentHeader() {
    const params = useParams({ from: '/(public)/snippets/$id' });
    const queryClient = useQueryClient();

    const { data: snippet } = useSuspenseQuery(getSnippetQueryOptions(params.id));

    const isPrivate = 'isPrivate' in snippet ? snippet.isPrivate : false;

    const onMutateSuccess = () => {
        queryClient.invalidateQueries(getSnippetQueryOptions(params.id));
    };
    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h1 className="font-heading font-bold text-3xl text-balance mb-2 capitalize">
                        {snippet.name}
                    </h1>
                    <p className="text-muted-foreground text-lg text-pretty first-letter:capitalize">
                        {snippet.description}
                    </p>
                </div>
                <SnippetActionsDropdown
                    snippet={snippet}
                    deleteSnippet={{
                        onSuccess: onMutateSuccess,
                    }}
                    moveSnippetToTrash={{
                        onSuccess: onMutateSuccess,
                    }}
                    forkSnippet={{
                        onSuccess: onMutateSuccess,
                    }}
                    addSnippetToFavourites={{
                        onSuccess: onMutateSuccess,
                    }}
                    removeSnippetFromFavourites={{
                        onSuccess: onMutateSuccess,
                    }}
                    showViewButton={false}
                />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <DeveloperIdentity developerInfo={snippet.creator} />

                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                        {snippet.language}
                    </Badge>
                    {!isPrivate ? (
                        <Badge variant="outline" className="text-xs">
                            <GlobeIcon className="h-3 w-3 mr-1" />
                            Public
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-xs">
                            <LockIcon className="h-3 w-3 mr-1" />
                            Private
                        </Badge>
                    )}
                </div>
            </div>

            <OnlineGuard>
                {!!snippet.tags.length && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {snippet.tags.map(tag => (
                            <Button key={tag.value} variant="link" size="sm" asChild>
                                <Link to="/search" search={{ tags: [tag.value] }}>
                                    #{tag.value}
                                </Link>
                            </Button>
                        ))}
                    </div>
                )}
            </OnlineGuard>
        </div>
    );
}
