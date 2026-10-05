import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { CurrentUserCollectionsOverlay } from '@/features/collection-listing/components/current-user-collections-overlay';
import { cn } from '@/lib/utils';
import React from 'react';
import { useForkSnippet } from '../hooks/use-fork-snippet';
import { ForkSnippetButton } from './fork-snippet-button';

interface ForkSnippetToCollectionProps extends React.ComponentProps<typeof ForkSnippetButton> {
    triggerAs: 'button' | 'dropdown';
    selectedCollectionId?: string;
}

export function ForkSnippetToCollection({
    triggerAs,
    snippetId,
    mutationCallbacks,
    selectedCollectionId,
    ...props
}: ForkSnippetToCollectionProps) {
    const [isCollectionsOverlayOpen, setIsCollectionsOverlayOpen] = React.useState(false);

    const { isPending, mutateAsync } = useForkSnippet({
        ...mutationCallbacks,
        onSuccess: (...props) => {
            setIsCollectionsOverlayOpen(false);
            mutationCallbacks?.onSuccess?.(...props);
        },
    });

    return (
        <>
            {triggerAs === 'dropdown' ? (
                <DropdownMenuItem onSelect={e => e.preventDefault()} asChild>
                    <ForkSnippetButton
                        {...props}
                        isLoading={isPending}
                        className={cn('justify-start', props.className)}
                        label="fork to collection"
                        snippetId={snippetId}
                        onClick={e => {
                            props.onClick?.(e);
                            if (!e.isDefaultPrevented()) {
                                e.preventDefault();
                                setIsCollectionsOverlayOpen(true);
                            }
                        }}
                    />
                </DropdownMenuItem>
            ) : (
                <ForkSnippetButton
                    {...props}
                    isLoading={isPending}
                    label="fork to collection"
                    snippetId={snippetId}
                    onClick={e => {
                        props.onClick?.(e);
                        if (!e.isDefaultPrevented()) {
                            e.preventDefault();
                            setIsCollectionsOverlayOpen(true);
                        }
                    }}
                />
            )}
            <CurrentUserCollectionsOverlay
                isOpen={isCollectionsOverlayOpen}
                onOpenChange={setIsCollectionsOverlayOpen}
                onSelect={collectionId => {
                    if (selectedCollectionId !== collectionId) {
                        mutateAsync({ collectionId, id: snippetId });
                    }
                }}
                selectedCollectionId={selectedCollectionId}
            />
        </>
    );
}
