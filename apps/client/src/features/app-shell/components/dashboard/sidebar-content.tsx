import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { listCurrentUserCollectionsQueryOptions } from '@/features/collection-listing/lib/collection-listing-query-options';
import { Permission } from '@snippetly/common/dto';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { DASHBOARD_NAV_ITEMS } from '../../lib/constants';

export function SidebarContent() {
    const { data } = useInfiniteQuery(listCurrentUserCollectionsQueryOptions({ take: 5 }));
    const collections = data?.pages.flatMap(p => p.items) ?? [];
    const ownerId = collections?.[0]?.creator.id;

    return (
        <div className="p-6">
            <nav className="space-y-2">
                {DASHBOARD_NAV_ITEMS.map(item => (
                    <PermissionGuard key={item.id} requiredPermissions={item.requiredPermissions}>
                        <Link
                            to={item.href}
                            activeProps={{
                                className: 'bg-primary/10 text-primary hover:bg-primary/10',
                            }}
                            activeOptions={{ exact: item.exact, includeSearch: true }}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                            <item.icon />
                            {item.title}
                        </Link>
                    </PermissionGuard>
                ))}
            </nav>

            <PermissionGuard
                requiredPermissions={[Permission.Authenticated, Permission.Owner, Permission.ReadCollection]}
                ownerId={ownerId}
            >
                {!!collections.length && (
                    <div className="mt-8">
                        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Collections
                        </h3>
                        <div className="space-y-1">
                            {collections?.map(collection => (
                                <Link
                                    key={collection.slug}
                                    to={'/dashboard/collections/$id'}
                                    params={{ id: collection.id }}
                                    className="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                    <div
                                        className={`size-4 rounded-full`}
                                        style={{
                                            backgroundColor: collection.color,
                                        }}
                                    />
                                    <span className="flex-1 truncate">{collection.name}</span>
                                    <span className="text-xs">{collection.snippetCount}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </PermissionGuard>
        </div>
    );
}
