import { Page } from '@/components/layout/page';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { CollectionForm } from '@/features/collections/components/forms/collection-form';
import { getCollectionQueryOptions } from '@/features/collections/lib/query-options';
import { listPopularTagsQueryOptions } from '@/features/tags/lib/list-tags-query-options';
import { UpdateCollectionPageHeader } from '@/features/update-collection/components/sections/update-collection-page-header';
import { useUpdateCollection } from '@/features/update-collection/hooks/use-update-collection';
import {
    updateCollectionFormSchema,
    type UpdateCollectionFormSchemaType,
} from '@/features/update-collection/lib/schema';
import { notFoundWithMetadata } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Permission } from '@snippetly/common/dto';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export const Route = createFileRoute('/(protected)/dashboard/collections/$id/edit/')({
    component: UpdateCollectionPage,
    head: async ({ params, match }) => {
        const { queryClient } = match.context;
        const data = await queryClient.query({
            ...getCollectionQueryOptions(params.id),
            staleTime: 'static',
        });
        return {
            meta: [
                {
                    name: 'description',
                    content: data.description ?? `Update Collection ${data.name} Info`,
                },
                {
                    title: `Update Collection ${data.name}`,
                },
            ],
        };
    },
    beforeLoad: async ({ params: { id }, context: { queryClient, auth } }) => {
        const data = await queryClient.query({ ...getCollectionQueryOptions(id), staleTime: 'static' });
        const { user } = auth;
        if (user?.id !== data.creator.id) {
            throw redirect({
                to: '/profile/$id',
                params: { id: data.creator.id },
            });
        }
    },
    loader: async ({ context: { queryClient }, params }) => {
        queryClient.query(listPopularTagsQueryOptions());
        return await queryClient.query({ ...getCollectionQueryOptions(params.id), staleTime: 'static' });
    },
});

function UpdateCollectionPage() {
    const { id } = Route.useParams();
    const { data } = useQuery(getCollectionQueryOptions(id));
    const qClient = useQueryClient();
    if (!data) {
        throw notFoundWithMetadata({
            data: {
                title: 'Collection not found',
                description: "The collection you are looking for doesn't exist or has been moved.",
            },
        });
    }
    const updateCollectionForm = useForm<UpdateCollectionFormSchemaType>({
        defaultValues: { ...data, tags: data.tags.map(t => t.value) },
        resolver: zodResolver(updateCollectionFormSchema),
    });

    const { mutateAsync, isPending } = useUpdateCollection({
        onSuccess: async data => {
            updateCollectionForm.reset({ ...data, tags: data.tags?.map(t => t.value) });
            await qClient.invalidateQueries(getCollectionQueryOptions(id));
            qClient.invalidateQueries(listCurrentUserCollectionsQueryOptions());
        },
    });
    return (
        <Page
            form={updateCollectionForm}
            submitHandler={updateCollectionForm.handleSubmit(values => mutateAsync(values))}
        >
            <UpdateCollectionPageHeader isPending={isPending} />
            <PermissionGuard
                requiredPermissions={[
                    Permission.Authenticated,
                    Permission.UpdateCollection,
                    Permission.Owner,
                ]}
                ownerId={data.creator.id}
            >
                <main className="container mx-auto px-2 lg:px-6 py-8 max-w-2xl">
                    <CollectionForm isPending={isPending} />
                </main>
            </PermissionGuard>
        </Page>
    );
}
