import { DeveloperIdentity } from '@/components/shared/developer-identity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { OnlineGuard } from '@/features/offline-snippet/components/shared/online-guard';
import { Permission } from '@snippetly/common/dto';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { CalendarIcon, Code2Icon, GlobeIcon, LockIcon } from 'lucide-react';
import { getCollectionQueryOptions } from '../../lib/query-options';
import { CollectionActionMenu } from '../shared/collection-action-menu';

export function CollectionPageMainContent() {
    const qClient = useQueryClient();
    const params = useParams({
        from: '/(public)/collections/$id',
    });
    const { data: collection } = useSuspenseQuery(getCollectionQueryOptions(params.id));

    const updatedAt = 'updatedAt' in collection ? collection.updatedAt : undefined;
    const isPrivate = 'isPrivate' in collection ? collection.isPrivate : false;

    const navigate = useNavigate();

    const onCollectionMutationSuccess = () => {
        qClient.invalidateQueries(getCollectionQueryOptions(params.id));
    };

    return (
        <div className="space-y-4 mb-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-wrap gap-2">
                        <div className={`size-12 rounded-lg flex items-center justify-center`}>
                            <Code2Icon
                                className={'size-8'}
                                style={{
                                    stroke: collection.color,
                                }}
                            />
                        </div>
                        <h1 className="font-heading font-bold text-3xl text-balance capitalize mb-2">
                            {collection.name}
                        </h1>
                    </div>
                    <CollectionActionMenu
                        collection={collection}
                        deleteCollection={{
                            onSuccess: () => {
                                navigate({ to: '/dashboard/collections' });
                                onCollectionMutationSuccess();
                            },
                        }}
                        forkCollection={{
                            onSuccess: onCollectionMutationSuccess,
                        }}
                        addCollectionToFavourites={{
                            onSuccess: onCollectionMutationSuccess,
                        }}
                        removeCollectionFromFavourites={{
                            onSuccess: onCollectionMutationSuccess,
                        }}
                        showViewButton={false}
                    />
                </div>
                <p className="text-muted-foreground text-lg text-pretty mb-4">{collection.description}</p>
            </div>

            <div className="flex items-center gap-4 flex-wrap w-full">
                <DeveloperIdentity developerInfo={collection.creator} />

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Code2Icon className="h-4 w-4" />
                        {collection.snippetsCount} snippets
                    </div>
                    <PermissionGuard
                        requiredPermissions={[
                            Permission.Authenticated,
                            Permission.ReadCollection,
                            Permission.Owner,
                        ]}
                        ownerId={collection.creator.id}
                    >
                        {updatedAt && (
                            <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                Updated {new Date(updatedAt).toLocaleDateString()}
                            </div>
                        )}
                    </PermissionGuard>
                </div>

                <div className="flex items-center gap-2">
                    {!isPrivate ? (
                        <Badge variant="outline" className="text-xs">
                            <GlobeIcon className="h-3 w-3 mr-1" />
                            Public
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-xs">
                            <LockIcon className="h-3 w-3 mr-1" />
                            Private
                        </Badge>
                    )}
                </div>
            </div>

            <OnlineGuard>
                {!!collection.tags.length && (
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                        {collection.tags.map(tag => (
                            <Button key={tag.value} variant="link" size="sm" asChild>
                                <Link to="/search" search={{ tags: [tag.value] }}>
                                    #{tag.value}
                                </Link>
                            </Button>
                        ))}
                    </div>
                )}
            </OnlineGuard>
        </div>
    );
}
