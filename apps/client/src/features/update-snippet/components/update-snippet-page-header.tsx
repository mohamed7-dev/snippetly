import { LoadingButton } from '@/components/inputs/loading-button';
import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { DeleteSnippetButton } from '@/features/snippet-delete/components/delete-snippet-button';
import { getSnippetQueryOptions } from '@/features/snippets/lib/snippet-query-options';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeftIcon, EyeIcon, SaveIcon } from 'lucide-react';

export function UpdateSnippetPageHeader({ isPending }: { isPending: boolean }) {
    const params = useParams({
        from: '/(protected)/dashboard/snippets/$id/edit/',
    });

    const { data: snippet } = useSuspenseQuery(getSnippetQueryOptions(params.id));

    const navigate = useNavigate();

    return (
        <HeaderWrapper className="justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" type="button" asChild>
                    <Link to={'/dashboard/snippets'} className="flex items-center gap-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Snippets
                    </Link>
                </Button>
                <h1 className="font-heading font-semibold text-lg">Edit Snippet</h1>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap">
                <Button disabled={isPending} type="button" variant="outline" asChild>
                    <Link to="/dashboard/snippets/$id" params={{ id: params.id }}>
                        <EyeIcon className="h-4 w-4 sm:mr-2" />
                        Preview
                    </Link>
                </Button>
                <DeleteSnippetButton
                    snippetId={snippet.id}
                    mutationCallbacks={{
                        onSuccess: () => {
                            navigate({ to: '/dashboard/snippets' });
                        },
                    }}
                    type="button"
                    variant={'destructive-outline'}
                    className="w-auto"
                />
                <LoadingButton isLoading={isPending} type="submit">
                    <SaveIcon className="h-4 w-4 sm:mr-2" />
                    Save Changes
                </LoadingButton>
            </div>
        </HeaderWrapper>
    );
}
