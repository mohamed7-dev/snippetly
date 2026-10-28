import { InstallAppButton } from '@/components/inputs/install-app-button';
import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { Logo } from '@/features/app-shell/components/logo';
import { BottomNavigation } from '@/features/app-shell/components/shared/bottom-navigation';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { isOfflineDashboardAvailable } from '@/features/offline-snippet/lib/common';
import { SearchBar } from '@/features/search/components/search-bar';
import { formatSearchInput } from '@/features/search/lib/search-input';
import { Permission } from '@snippetly/common/dto';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import React from 'react';

const normalizePathname = (pathname: string) => {
    return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
};

export function PublicLayout() {
    const pathname = useRouterState({ select: state => state.location.pathname });
    const normalizedPathname = normalizePathname(pathname);

    if (normalizedPathname === '/goodbye') {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
            <PublicLayoutHeader />
            <Outlet />
            <BottomNavigation />
        </div>
    );
}

function PublicLayoutHeader() {
    const { isAuthenticated } = useAuth();
    const search = useRouterState({ select: state => state.location.search });
    const initialSearch = formatSearchInput(search);
    const pathname = useRouterState({ select: state => state.location.pathname });
    const normalizedPathname = normalizePathname(pathname);
    const isLandingPage = normalizedPathname === '/';

    return (
        <HeaderWrapper>
            <div className="container mx-auto px-2 sm:px-6 lg:px-8">
                <div className="flex min-h-14 items-center justify-center has-[>button]:justify-between lg:hidden">
                    <Logo />
                    <InstallAppButton />
                </div>
                <div className="hidden min-h-16 items-center justify-between gap-4 py-2 lg:flex">
                    <Logo />
                    {!isLandingPage && (
                        <SearchBar className="w-96 max-w-full flex-1" initialValue={initialSearch} />
                    )}
                    <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/discover" activeProps={{ className: 'text-primary' }}>
                                Discover
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/offline" activeProps={{ className: 'text-primary' }}>
                                Offline library
                            </Link>
                        </Button>
                    </nav>
                    <div className="flex shrink-0 items-center gap-2">
                        <InstallAppButton />
                        <PermissionGuard
                            requiredPermissions={[Permission.Authenticated]}
                            isAvailableOffline={isOfflineDashboardAvailable()}
                        >
                            <Button asChild>
                                <Link to="/dashboard">Dashboard</Link>
                            </Button>
                        </PermissionGuard>

                        {!isAuthenticated && !isOfflineDashboardAvailable() && (
                            <React.Fragment>
                                <Button variant="ghost" asChild>
                                    <Link to="/sign-in">Sign in</Link>
                                </Button>
                                <Button asChild>
                                    <Link to="/register-account">Get started</Link>
                                </Button>
                            </React.Fragment>
                        )}
                    </div>
                </div>
            </div>
        </HeaderWrapper>
    );
}
