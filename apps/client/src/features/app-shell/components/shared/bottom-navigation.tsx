import { CreateCollectionIcon, CreateSnippetIcon } from '@/components/shared/creation-icons';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Permission } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { CompassIcon, HouseIcon, LibraryIcon, PlusIcon, SearchIcon } from 'lucide-react';
const itemClassName = 'h-full min-w-16 flex-1 flex-col gap-1 rounded-none px-2 py-2 text-[10px]';
const activeClassName = 'text-primary bg-primary/10';

export function BottomNavigation() {
    const { isAuthenticated } = useAuth();
    const homePath = isAuthenticated ? '/dashboard' : '/';

    return (
        <nav
            aria-label="Main navigation"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden"
        >
            <div className="flex h-16 overflow-x-auto">
                <Button variant="ghost" asChild className={itemClassName}>
                    <Link
                        to={homePath}
                        activeOptions={{ exact: true, includeSearch: false }}
                        activeProps={{ className: activeClassName }}
                    >
                        <HouseIcon className="size-5" />
                        <span>Home</span>
                    </Link>
                </Button>
                <Button variant="ghost" asChild className={itemClassName}>
                    <Link to="/discover" activeProps={{ className: activeClassName }}>
                        <CompassIcon className="size-5" />
                        <span>Discover</span>
                    </Link>
                </Button>

                <PermissionGuard requiredPermissions={[Permission.Authenticated]} isAvailableOffline>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="default"
                                className={itemClassName}
                                aria-label="Create"
                            >
                                <PlusIcon className="size-5" />
                                <span>Create</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="center">
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard/snippets/new">
                                    <CreateSnippetIcon className="size-4" />
                                    Create snippet
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to="/dashboard/collections/new">
                                    <CreateCollectionIcon className="size-4" />
                                    Create collection
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </PermissionGuard>
                <Button variant="ghost" asChild className={itemClassName}>
                    <Link to="/search-page" activeProps={{ className: activeClassName }}>
                        <SearchIcon className="size-5" />
                        <span>Search</span>
                    </Link>
                </Button>
                <Button variant="ghost" asChild className={itemClassName}>
                    <Link to="/offline" activeProps={{ className: activeClassName }}>
                        <LibraryIcon className="size-5" />
                        <span>Offline</span>
                    </Link>
                </Button>
            </div>
        </nav>
    );
}
