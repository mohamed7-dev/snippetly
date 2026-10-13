import { InstallAppButton } from '@/components/inputs/install-app-button';
import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { Logo } from '@/features/app-shell/components/logo';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';

export function PublicLayout() {
    const pathname = useRouterState({ select: state => state.location.pathname });
    const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

    if (normalizedPathname === '/' || normalizedPathname === '/goodbye') {
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

    return (
        <HeaderWrapper className="py-0">
            <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-2 sm:px-6 lg:px-8">
                <Logo />
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
                        <Button size="sm" asChild>
                            <Link to="/dashboard">Dashboard</Link>
                        </Button>
                    ) : status === 'unauthenticated' ? (
                        <>
                            <InstallAppButton className="hidden sm:inline-flex" />
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/sign-in">Sign in</Link>
                            </Button>
                            <Button size="sm" className="hidden sm:inline-flex" asChild>
                                <Link to="/register-account">Get started</Link>
                            </Button>
                        </>
                    ) : null}
                </div>
            </div>
        </HeaderWrapper>
    );
}
