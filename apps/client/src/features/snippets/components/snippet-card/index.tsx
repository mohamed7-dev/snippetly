import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import type { ApiSuccess } from '@/lib/api-client';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import { Permission, type SnippetListDtoType } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { EditIcon, GitForkIcon } from 'lucide-react';
import { CopyButton } from '../shared/copy-button';
import { SnippetActionsDropdown, type SnippetActionsDropdownProps } from '../shared/snippet-actions-dropdown';

type SnippetItem = ApiSuccess<SnippetListDtoType['output']>['items'][number];

interface SnippetCardProps extends Omit<SnippetActionsDropdownProps, 'snippet'> {
    snippet: SnippetItem;
}

export function SnippetCard({ snippet, ...props }: SnippetCardProps) {
    const creator = snippet.creator;
    const { fullName, initials: avatarFallback } = formatDeveloperInfo(creator);

    const isPrivate = 'isPrivate' in snippet ? snippet.isPrivate : false;
    const createdAt = 'createdAt' in snippet ? snippet.createdAt : undefined;

    return (
        <Card className="group h-full overflow-hidden rounded-xl pt-0 transition-all duration-200 hover:border-primary/40 hover:shadow-lg">
            <div className="h-1.5 bg-linear-to-r from-primary via-primary/60 to-transparent" />
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                        <CardTitle className="text-lg font-heading hover:text-primary transition-colors">
                            <Link
                                to={'/dashboard/snippets/$id'}
                                params={{ id: snippet.id }}
                                preload={false}
                                className="capitalize"
                            >
                                {snippet.name}
                            </Link>
                        </CardTitle>
                        {snippet.forkedFrom && (
                            <div
                                className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted/60 px-2 py-1 text-xs text-muted-foreground"
                                aria-label="Fork attribution"
                            >
                                <GitForkIcon className="size-3 shrink-0" aria-hidden="true" />
                                <Link
                                    to="/dashboard/snippets/$id"
                                    params={{ id: snippet.forkedFrom.id }}
                                    preload={false}
                                    className="max-w-36 truncate font-medium text-foreground/80 hover:text-primary"
                                    title={snippet.forkedFrom.name}
                                >
                                    {snippet.forkedFrom.name}
                                </Link>
                                <span aria-hidden="true">·</span>
                                <Link
                                    to="/profile/$id"
                                    params={{ id: snippet.forkedFrom.creator.id }}
                                    preload={false}
                                    className="inline-flex min-w-0 items-center gap-1 hover:text-primary"
                                    title={`Original author: ${snippet.forkedFrom.creator.firstName} ${snippet.forkedFrom.creator.lastName}`}
                                >
                                    <Avatar className="size-4">
                                        <AvatarImage
                                            src={snippet.forkedFrom.creator.image || '/placeholder.svg'}
                                            alt=""
                                        />
                                        <AvatarFallback className="text-[8px]">
                                            {snippet.forkedFrom.creator.firstName.slice(0, 1)}
                                            {snippet.forkedFrom.creator.lastName.slice(0, 1)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="max-w-24 truncate">
                                        {snippet.forkedFrom.creator.firstName}{' '}
                                        {snippet.forkedFrom.creator.lastName}
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                    <SnippetActionsDropdown snippet={snippet} {...props} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={creator.image || '/placeholder.svg'} alt={avatarFallback} />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div>
                            <Link
                                to={'/profile/$id'}
                                params={{ id: creator.id }}
                                className="font-semibold hover:text-primary"
                            >
                                {fullName}
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs font-mono">
                            {snippet.language}
                        </Badge>
                        {!isPrivate && (
                            <Badge variant="outline" className="text-xs">
                                Public
                            </Badge>
                        )}
                        {createdAt && (
                            <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(createdAt)?.toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
                <div className="h-48 bg-muted/50 rounded-lg p-3 font-mono text-sm overflow-hidden border">
                    <pre className="text-foreground whitespace-pre-wrap line-clamp-6 text-xs leading-relaxed">
                        {snippet.code}
                    </pre>
                </div>
                <div className="flex items-center gap-1 mt-3 flex-wrap">
                    {'tags' in snippet
                        ? snippet?.tags?.map(tag => (
                              <Badge
                                  key={tag.value}
                                  variant="outline"
                                  className="text-xs hover:bg-primary/10 cursor-pointer"
                              >
                                  #{tag.value}
                              </Badge>
                          ))
                        : null}
                </div>
                <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton code={snippet.code} />
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.Owner,
                            Permission.UpdateSnippet,
                        ]}
                        ownerId={creator.id}
                    >
                        <Button size="sm" variant="ghost" asChild>
                            <Link
                                to="/dashboard/snippets/$id/edit"
                                params={{ id: snippet.id }}
                                preload={false}
                            >
                                <EditIcon className="h-3 w-3 mr-1" />
                                Edit
                            </Link>
                        </Button>
                    </PermissionGuard>
                </div>
            </CardContent>
        </Card>
    );
}
