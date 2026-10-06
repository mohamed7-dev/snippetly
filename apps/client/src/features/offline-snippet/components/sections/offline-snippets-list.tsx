import { SectionLoader } from '@/components/feedback/section-loader';
import { StatusCard } from '@/components/feedback/status-card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import React from 'react';
import { useOfflineSnippetStore } from '../../hooks/use-offline-snippet-store';
import type { OfflineSnippetItem } from '../../lib/store';

export function OfflineSnippetsList() {
    const {
        list: { query, isPending },
    } = useOfflineSnippetStore();
    const [data, setData] = React.useState<OfflineSnippetItem[]>([]);

    React.useEffect(() => {
        const list = async () => {
            const data = await query();
            setData(data);
        };

        list();
    }, []);

    if (isPending) {
        return <SectionLoader message="Loading offline snippets..." />;
    }

    if (!data.length) {
        return (
            <StatusCard
                variant="empty"
                title="No offline snippets yet"
                description="You haven't saved any snippets for offline use yet."
                layout="section"
            />
        );
    }

    return (
        <ul className="space-y-3">
            {data.map(snippet => (
                <li key={snippet.id} className="border rounded-md p-3 flex items-center justify-between">
                    <div className="space-y-4">
                        <div className="font-medium capitalize">{snippet.name}</div>
                        {snippet.description ? (
                            <div className="text-sm opacity-80 line-clamp-2 first-letter:capitalize">
                                {snippet.description}
                            </div>
                        ) : null}
                    </div>
                    <Button variant={'link'} asChild>
                        <Link to="/offline/$id" params={{ id: snippet.id }}>
                            View Snippet
                        </Link>
                    </Button>
                </li>
            ))}
        </ul>
    );
}
