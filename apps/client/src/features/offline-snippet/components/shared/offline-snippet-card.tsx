import { CardStrip } from '@/components/shared/card-strip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { OfflineSnippetItem } from '@/features/offline-snippet/lib/store';
import { Link } from '@tanstack/react-router';
import { CalendarClockIcon, Code2Icon, FolderIcon } from 'lucide-react';

export function OfflineSnippetCard({ snippet }: { snippet: OfflineSnippetItem }) {
    const visibleTags = snippet.tags.slice(0, 3);
    const additionalTagCount = snippet.tags.length - visibleTags.length;

    return (
        <Link
            to="/offline/$id"
            params={{ id: snippet.id }}
            className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <Card className="h-full overflow-hidden py-0 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-lg">
                <CardStrip />
                <CardHeader className="gap-4 px-5 pb-0 pt-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Code2Icon className="size-5" />
                            </div>
                            <div className="min-w-0 space-y-1">
                                <CardTitle className="line-clamp-1 text-base capitalize group-hover:text-primary">
                                    {snippet.name}
                                </CardTitle>
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CalendarClockIcon className="size-3.5" />
                                    Saved {new Date(snippet.savedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0 capitalize">
                            {snippet.language}
                        </Badge>
                    </div>
                    <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                        {snippet.description || 'A handy snippet, saved for your next coding session.'}
                    </p>
                </CardHeader>
                <CardContent className="px-5">
                    <div className="overflow-hidden rounded-lg border bg-muted/60 p-3">
                        <pre className="line-clamp-3 min-h-15 whitespace-pre-wrap break-all font-mono text-xs leading-5 text-foreground/80">
                            {snippet.code}
                        </pre>
                    </div>
                </CardContent>
                <CardFooter className="flex-wrap gap-2 px-5 pb-5 pt-0">
                    {snippet.collection?.name && (
                        <Badge variant="outline" className="max-w-full truncate">
                            <FolderIcon className="size-3" />
                            {snippet.collection.name}
                        </Badge>
                    )}
                    {visibleTags.map(tag => (
                        <Badge key={tag.value} variant="secondary" className="max-w-28 truncate">
                            #{tag.value}
                        </Badge>
                    ))}
                    {additionalTagCount > 0 && (
                        <span className="text-xs text-muted-foreground">+{additionalTagCount}</span>
                    )}
                </CardFooter>
            </Card>
        </Link>
    );
}
