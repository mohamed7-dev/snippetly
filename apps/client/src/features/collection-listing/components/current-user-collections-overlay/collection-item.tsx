import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CurrentUserCollectionsOverlayProps } from '.';

type CollectionItemProps = {
    collection: { id: string; name: string; color: string; isPending?: boolean };
    onSelect: CurrentUserCollectionsOverlayProps['onSelect'];
    selectedItemId?: string;
};
export function CollectionItem({ collection, onSelect, selectedItemId }: CollectionItemProps) {
    const isSelected = selectedItemId === collection.id;

    return (
        <article
            className={cn(
                'flex items-center justify-between px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted',
                isSelected && 'border-2 border-secondary',
            )}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`size-4 rounded-full`}
                    style={{
                        backgroundColor: collection.color,
                    }}
                />
                <span className="flex-1">
                    {collection.name}
                    {collection.isPending && (
                        <span className="ms-2 text-xs text-muted-foreground">Waiting to sync</span>
                    )}
                </span>
            </div>
            <Button className="rounded-full" onClick={() => onSelect(collection.id, collection.name)}>
                {isSelected ? 'Selected' : 'Select'}
            </Button>
        </article>
    );
}
