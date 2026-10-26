import { CardStrip } from '@/components/shared/card-strip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OfflineCollectionItem } from '@/features/offline-snippet/lib/store';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';

export function OfflineCollectionCard({
    collection,
    preview = false,
    linkWholeCard = false,
}: {
    collection: OfflineCollectionItem;
    preview?: boolean;
    linkWholeCard?: boolean;
}) {
    const snippets = collection.snippets ?? [];
    const visibleSnippets = preview ? snippets.slice(0, 3) : snippets;

    const card = (
        <Card className="h-full overflow-hidden transition-all hover:border-primary/40 hover:shadow-md pt-0">
            <CardStrip />
            <CardHeader className="gap-2 px-5 pt-5">
                <div className="flex items-start justify-between gap-3">
                    {linkWholeCard ? (
                        <CardTitle className="line-clamp-2 text-base">{collection.name}</CardTitle>
                    ) : (
                        <Link
                            to="/offline/collections/$id"
                            params={{ id: collection.id }}
                            className="group min-w-0"
                        >
                            <CardTitle className="line-clamp-2 text-base group-hover:text-primary">
                                {collection.name}
                            </CardTitle>
                        </Link>
                    )}
                    <Badge variant="secondary" className="shrink-0">
                        {snippets.length} snippets
                    </Badge>
                </div>
                {collection.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{collection.description}</p>
                )}
            </CardHeader>
            <CardContent className="px-5 pb-5">
                {visibleSnippets.length ? (
                    <ul className="space-y-2 border-t pt-3">
                        {visibleSnippets.map(snippet => (
                            <li key={snippet.id}>
                                {linkWholeCard ? (
                                    <span className="block truncate text-sm">{snippet.name}</span>
                                ) : (
                                    <Link
                                        to="/offline/$id"
                                        params={{ id: snippet.id }}
                                        className="block truncate text-sm hover:text-primary hover:underline"
                                    >
                                        {snippet.name}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="border-t pt-3 text-sm text-muted-foreground">
                        No snippets matched the selected filters.
                    </p>
                )}
                {preview &&
                    snippets.length > visibleSnippets.length &&
                    (linkWholeCard ? (
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                            and {snippets.length - visibleSnippets.length} more
                            <ArrowRightIcon className="size-3.5" />
                        </span>
                    ) : (
                        <Link
                            to="/offline/collections/$id"
                            params={{ id: collection.id }}
                            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            and {snippets.length - visibleSnippets.length} more
                            <ArrowRightIcon className="size-3.5" />
                        </Link>
                    ))}
            </CardContent>
        </Card>
    );

    return linkWholeCard ? (
        <Link
            to="/offline/collections/$id"
            params={{ id: collection.id }}
            className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            {card}
        </Link>
    ) : (
        card
    );
}
