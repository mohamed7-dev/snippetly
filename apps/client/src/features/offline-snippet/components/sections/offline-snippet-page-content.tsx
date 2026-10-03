import { StatusCard } from '@/components/feedback/status-card';
import { LoadingButton } from '@/components/inputs/loading-button';
import { Badge } from '@/components/ui/badge';
import { registerLanguage } from '@/lib/highlightjs';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Trash2Icon } from 'lucide-react';
import React from 'react';
import { useOfflineSnippetStore } from '../../hooks/useOfflineSnippetStore';
import type { OfflineSnippetItem } from '../../lib/store';

export function OfflineSnippetPageContent({ id }: { id: string }) {
    const {
        getOne: { query, isPending },
        remove: { mutate, isPending: isRemoving },
    } = useOfflineSnippetStore();
    const [snippet, setSnippet] = React.useState<OfflineSnippetItem>();
    const router = useRouter();
    const navigate = useNavigate();

    const handleRemove = async () => {
        await mutate({ id });
        navigate({ to: '/offline' });
        router.invalidate();
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
        const codeElRef = React.useRef<HTMLElement | null>(null);
        const code = snippet?.code ?? '';
        const lang = (snippet?.language ?? 'plaintext').toLowerCase();

        React.useEffect(() => {
            let cancelled = false;
            (async () => {
                try {
                    const hljs = (await import('highlight.js/lib/core')).default;
                    await registerLanguage(hljs, lang);
                    if (!cancelled && codeElRef.current) {
                        hljs.highlightElement(codeElRef.current);
                    }
                } catch {
                    if (!cancelled && codeElRef.current) {
                        codeElRef.current.textContent = code;
                    }
                }
            })();
            return () => {
                cancelled = true;
            };
        }, [code, lang]);

        return (
            <article className="space-y-3">
                <h1 className="text-2xl font-semibold">{snippet.name}</h1>
                {snippet?.description ? <p className="opacity-80">{snippet?.description}</p> : null}
                {snippet ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <p className="text-sm opacity-70">
                                    saved on {new Date(snippet.savedAt).toLocaleDateString()}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                    {snippet.language}
                                </Badge>
                            </div>
                            <LoadingButton
                                isLoading={isRemoving}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={handleRemove}
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </LoadingButton>
                        </div>
                        <pre className="bg-muted/50 p-3 rounded-md overflow-auto text-sm">
                            <code ref={codeElRef} className={`language-${lang}`}>
                                {code}
                            </code>
                        </pre>

                        {snippet?.note ? (
                            <div className="space-y-2">
                                <h2 className="text-sm font-semibold">Snippet Note</h2>
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
