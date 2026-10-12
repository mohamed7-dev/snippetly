import { SnippetListLayout } from '@/components/shared/snippet-list-layout';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCurrentUserSnippetsQueryOptions } from '@/features/snippet-listing/lib/snippet-listing-query-options';
import { SnippetCard } from '@/features/snippets/components/snippet-card';
import { Permission } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseInfiniteQuery } from '@tanstack/react-query';

export function InsightsPageSnippetsList() {
    const { data } = useSuspenseInfiniteQuery(listCurrentUserSnippetsQueryOptions({ take: 5 }));

    const snippets = data.pages.flatMap(p => p.items) ?? [];
    const ownerId = snippets?.[0]?.creator.id;
    const qClient = useQueryClient();

    const onMutateSnippetSuccess = async () => {
        await qClient.invalidateQueries(listCurrentUserSnippetsQueryOptions({ take: 5 }));
    };

    return (
        <PermissionGuard
            requiredPermissions={[Permission.Authenticated, Permission.Owner, Permission.ReadSnippet]}
            ownerId={ownerId}
        >
            <SnippetListLayout>
                {snippets?.map(snippet => (
                    <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        deleteSnippet={{
                            onSuccess: onMutateSnippetSuccess,
                        }}
                        forkSnippet={{
                            onSuccess: onMutateSnippetSuccess,
                        }}
                    />
                ))}
            </SnippetListLayout>
        </PermissionGuard>
    );
}
