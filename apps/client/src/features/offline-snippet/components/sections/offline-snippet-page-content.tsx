import { StatusCard } from '@/components/feedback/status-card';
import { LoadingButton } from '@/components/inputs/loading-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SnippetCodeBlock } from '@/features/snippets/components/shared/snippet-code-block';
import { useDeleteConfirmation } from '@/hooks/use-delete-confirmation';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Trash2Icon } from 'lucide-react';
import React from 'react';
import { useOfflineSnippetStore } from '../../hooks/use-offline-snippet-store';
import type { OfflineSnippetItem } from '../../lib/store';

export function OfflineSnippetPageContent({ id }: { id: string }) {
    const {
        getOne: { query, isPending },
        remove: { mutate, isPending: isRemoving },
    } = useOfflineSnippetStore();
    const [snippet, setSnippet] = React.useState<OfflineSnippetItem>();
    const router = useRouter();
    const navigate = useNavigate();

    const { confirm, resetAndClose } = useDeleteConfirmation();

    const handleDelete = async () => {
        confirm({
            title: 'Delete snippet',
            description: "Are you sure you want to delete this snippet? this action can't be undone.",
            isPending: isPending,
            onConfirm: async () => {
                await mutate({ id }).then(() => {
                    resetAndClose?.();
                    navigate({ to: '/offline' });
                    router.invalidate();
                });
            },
        });
    };

    React.useEffect(() => {
        const get = async () => {
            const result = await query({ id });
            setSnippet(result);
        };

        get();
    }, [id, query]);

    if (!snippet && !isPending) {
        return (
            <StatusCard
                variant="empty"
                title="Not saved for offline"
                description={"This snippet isn't in your offline library."}
                layout="section"
            />
        );
    }

    if (snippet && !isPending) {
        const nameFallback =
            snippet.creator.firstName.slice(0, 1) + ' ' + snippet.creator.lastName.slice(0, 1);
        const fullName = snippet.creator.firstName + ' ' + snippet.creator.lastName;
        return (
            <article className="space-y-3">
                <h1 className="text-2xl font-semibold capitalize">{snippet.name}</h1>
                {snippet?.description ? (
                    <p className="opacity-80 first-letter:capitalize my-6">{snippet?.description}</p>
                ) : null}
                {snippet ? (
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            {snippet.creator && (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={snippet.creator.image || '/placeholder.svg'}
                                            alt={nameFallback}
                                        />
                                        <AvatarFallback>{nameFallback}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium">{fullName}</p>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <p className="text-sm opacity-70 capitalize">
                                        saved on {new Date(snippet.savedAt).toLocaleDateString()}
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                        {snippet.language}
                                    </Badge>
                                </div>
                                <LoadingButton
                                    isLoading={isRemoving}
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDelete}
                                >
                                    <Trash2Icon className="h-4 w-4" />
                                </LoadingButton>
                            </div>
                        </div>

                        <SnippetCodeBlock snippet={snippet} />

                        {snippet?.note ? (
                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold capitalize">Snippet Note</h2>
                                <p className="bg-muted/50 p-3 rounded-md overflow-auto text-sm">
                                    {snippet.note}
                                </p>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <p className="text-sm opacity-70">No cached data. Content may be limited offline.</p>
                )}
            </article>
        );
    }
    return null;
}
