import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { ApiSuccess } from '@/lib/api-client';
import type { SnippetListDtoType } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { EditIcon } from 'lucide-react';
import { CopyButton } from '../shared/copy-button';
import { SnippetActionsDropdown, type SnippetActionsDropdownProps } from '../shared/snippet-actions-dropdown';

type SnippetItem = ApiSuccess<SnippetListDtoType['output']>['items'][number];

interface SnippetCardProps extends Omit<SnippetActionsDropdownProps, 'snippet'> {
    snippet: SnippetItem;
}

export function SnippetCard({ snippet, onCopy, ...props }: SnippetCardProps) {
    const { user } = useAuth();
    const creator = snippet.creator;
    const avatarFallback = creator.firstName.slice(0, 1) + ' ' + creator.lastName.slice(0, 1);
    const fullName = creator.firstName + ' ' + creator.lastName;
    const isPrivate = 'isPrivate' in snippet ? snippet.isPrivate : false;
    const createdAt = 'createdAt' in snippet ? snippet.createdAt : undefined;

    return (
        <Card className="border-border hover:shadow-lg transition-all duration-200 group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-heading group-hover:text-primary transition-colors">
                            <Link
                                to={'/dashboard/snippets/$id'}
                                params={{ id: snippet.id }}
                                preload={false}
                                className="capitalize"
                            >
                                {snippet.name}
                            </Link>
                        </CardTitle>
                        <CardDescription className="my-2 text-pretty first-letter:capitalize">
                            {snippet.description}
                        </CardDescription>
                    </div>
                    <SnippetActionsDropdown snippet={snippet} onCopy={onCopy} {...props} />
                </div>
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
            </CardHeader>
            <CardContent className="pt-0 flex-col justify-between">
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
                    <CopyButton code={snippet.code} onClick={() => onCopy} />
                    {creator.id === user?.id && (
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
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
