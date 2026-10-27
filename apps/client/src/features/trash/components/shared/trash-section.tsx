import { InfiniteLoader } from '@/components/feedback/infinite-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RotateCcwIcon, Trash2Icon } from 'lucide-react';

export type TrashResource = 'snippet' | 'collection';

export interface TrashItem {
    id: string;
    resource: TrashResource;
    name: string;
    details: string;
    deletedAt: Date | null;
}

export function TrashSection({
    title,
    items,
    isLoading,
    isError,
    errorMessage,
    onRestore,
    onDelete,
    isRestoring,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: {
    title: string;
    items: TrashItem[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    onRestore: (item: TrashItem) => void;
    onDelete: (item: TrashItem) => void;
    isRestoring: boolean;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
}) {
    return (
        <section className="space-y-4">
            {isLoading && <StatusCard variant="loading" title={`Loading ${title.toLowerCase()}`} />}
            {isError && (
                <StatusCard
                    variant="error"
                    title={`Couldn't load ${title.toLowerCase()}`}
                    description={errorMessage}
                />
            )}
            {!isLoading && !isError && items.length === 0 && (
                <StatusCard variant="empty" title={`No ${title.toLowerCase()} in trash`} layout="inline" />
            )}
            {!!items.length && (
                <div className="space-y-4">
                    {items.map(item => (
                        <Card key={`${item.resource}-${item.id}`}>
                            <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 space-y-2">
                                    <h3 className="truncate font-medium capitalize">{item.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {item.details} · Deleted{' '}
                                        {item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : ''}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isRestoring}
                                        onClick={() => void onRestore(item)}
                                    >
                                        <RotateCcwIcon className="mr-2 size-4" />
                                        Restore
                                    </Button>
                                    <Button
                                        variant="destructive-outline"
                                        size="sm"
                                        onClick={() => onDelete(item)}
                                    >
                                        <Trash2Icon className="mr-2 size-4" />
                                        Delete permanently
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            <InfiniteLoader
                isManual
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
            />
        </section>
    );
}
