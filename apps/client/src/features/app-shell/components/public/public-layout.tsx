import { InstallAppButton } from '@/components/inputs/install-app-button';
import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { Logo } from '@/features/app-shell/components/logo';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { SearchBar } from '@/features/search/components/search-bar';
import { formatSearchInput } from '@/features/search/lib/search-input';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';

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
        <div className="min-h-screen">
            <PublicLayoutHeader />
            <Outlet />
        </div>
    );
}

function PublicLayoutHeader() {
    const { isAuthenticated, status } = useAuth();
    const search = useRouterState({ select: state => state.location.search });
    const initialSearch = formatSearchInput(search);
    const pathname = useRouterState({ select: state => state.location.pathname });
    const normalizedPathname = normalizePathname(pathname);
    const isLandingPage = normalizedPathname === '/';

    return (
        <HeaderWrapper className="py-0">
            <div className="container mx-auto flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-2 py-2 sm:px-6 lg:px-8">
                <Logo />
                {!isLandingPage && (
                    <SearchBar className="flex-1 w-full order-3 sm:order-0" initialValue={initialSearch} />
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
                    {isAuthenticated ? (
                        <Button asChild>
                            <Link to="/dashboard">Dashboard</Link>
                        </Button>
                    ) : status === 'unauthenticated' ? (
                        <>
                            <InstallAppButton className="hidden sm:inline-flex" />
                            <Button variant="ghost" asChild>
                                <Link to="/sign-in">Sign in</Link>
                            </Button>
                            <Button className="hidden sm:inline-flex" asChild>
                                <Link to="/register-account">Get started</Link>
                            </Button>
                        </>
                    ) : null}
                </div>
            </div>
        </HeaderWrapper>
    );
}
