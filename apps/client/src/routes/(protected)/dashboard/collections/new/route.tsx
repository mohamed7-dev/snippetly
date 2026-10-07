import { Page } from '@/components/layout/page';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { CollectionForm } from '@/features/collections/components/forms/collection-form';
import { CreateCollectionPageHeader } from '@/features/create-collection/components/sections/create-collection-page-header';
import { useCreateCollection } from '@/features/create-collection/hooks/use-create-collection';
import {
    createCollectionFormSchema,
    type CreateCollectionFormSchemaType,
} from '@/features/create-collection/lib/schema';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { redirectSchema } from '@/lib/zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Permission } from '@snippetly/common/dto';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(protected)/dashboard/collections/new')({
    component: RouteComponent,
    validateSearch: redirectSchema,
    head: () => {
        return {
            meta: [
                {
                    title: 'Create New Collection',
                },
            ],
        };
    },
    loader: ({ context: { queryClient } }) => {
        queryClient.query({ ...listPopularTagsQueryOptions() }).catch();
    },
});

function RouteComponent() {
    const navigate = Route.useNavigate();
    const qClient = useQueryClient();
    const createCollectionForm = useForm<CreateCollectionFormSchemaType>({
        defaultValues: {
            name: '',
            description: '',
            color: '',
            isPrivate: false,
            allowForking: true,
            tags: [],
        },
        resolver: zodResolver(createCollectionFormSchema),
    });
    const { mutateAsync, isPending } = useCreateCollection({
        onSuccess: async data => {
            createCollectionForm.reset();
            await navigate({ to: '../$id', params: { id: data.id } });
            qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
        },
    });
    return (
        <Page
            form={createCollectionForm}
            submitHandler={createCollectionForm.handleSubmit(values => mutateAsync(values))}
        >
            <CreateCollectionPageHeader isPending={isPending} />
            <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.CreateCollection]}>
                <main className="container mx-auto px-2 lg:px-6 py-8 max-w-2xl">
                    <CollectionForm isPending={isPending} />
                </main>
            </PermissionGuard>
        </Page>
    );
}
