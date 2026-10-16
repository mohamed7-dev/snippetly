import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { GitForkIcon, GlobeIcon, LockIcon } from 'lucide-react';
import { getSnippetQueryOptions } from '../../lib/snippet-query-options';
import { SnippetActionsDropdown } from '../shared/snippet-actions-dropdown';

export function SnippetPageContentHeader() {
    const params = useParams({ from: '/(public)/snippets/$id' });
    const queryClient = useQueryClient();

    const { data: snippet } = useSuspenseQuery(getSnippetQueryOptions(params.id));

    const isPrivate = 'isPrivate' in snippet ? snippet.isPrivate : false;

    const { fullName, initials } = formatDeveloperInfo(snippet.creator);

    const onMutateSuccess = (_data?: any, actionType?: 'add' | 'remove') => {
        // TODO: update fav info in the cache optimistically
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
                        onSuccess: () => {
                            onMutateSuccess();
                        },
                    }}
                    moveSnippetToTrash={{
                        onSuccess: () => {
                            onMutateSuccess();
                        },
                    }}
                    forkSnippet={{
                        onSuccess: () => {
                            onMutateSuccess();
                        },
                    }}
                    addSnippetToFavourites={{
                        onSuccess: data => {
                            onMutateSuccess(data, 'add');
                        },
                    }}
                    removeSnippetFromFavourites={{
                        onSuccess: data => {
                            onMutateSuccess(data, 'remove');
                        },
                    }}
                    showViewButton={false}
                />
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Link to="/profile/$id" params={{ id: snippet.creator.id }}>
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={snippet.creator.image || '/placeholder.svg'} alt={initials} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <p className="text-sm font-medium">{fullName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <GitForkIcon className="h-4 w-4" /> 0
                    </div>
                </div>

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

            {!!snippet.tags.length && (
                <div className="flex items-center gap-2 flex-wrap">
                    {snippet.tags.map(tag => (
                        <Badge key={tag.value} variant="outline" className="text-xs">
                            #{tag.value}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
