import { InstallAppButton } from '@/components/inputs/install-app-button';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Permission } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { HeaderWrapper } from '../header-wrapper';
import { Logo } from '../logo';

export function LandingLayoutHeader() {
    const { isAuthenticated } = useAuth();
    return (
        <HeaderWrapper className="py-0">
            <div className="container mx-auto sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Logo />
                    <nav className="hidden md:flex items-center gap-6">
                        <Button variant={'ghost'} asChild>
                            <Link to="." hash="features">
                                Features
                            </Link>
                        </Button>
                        <Button variant={'ghost'} asChild>
                            <Link to="." hash="testimonials">
                                Testimonials
                            </Link>
                        </Button>
                        <Button variant={'ghost'} asChild>
                            <Link to="/discover">Discover</Link>
                        </Button>
                        <Button variant={'ghost'} asChild>
                            <Link to="/offline">Offline Library</Link>
                        </Button>
                    </nav>
                    <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                        <Button className="items-center" variant="ghost" asChild>
                            <Link to={'/dashboard'}>Go To Dashboard</Link>
                        </Button>
                    </PermissionGuard>

                    {!isAuthenticated && (
                        <div className="flex items-center gap-3">
                            <InstallAppButton className="hidden sm:inline-flex" />
                            <Button variant="ghost" size="sm" asChild>
                                <Link to={'/sign-in'}>Sign In</Link>
                            </Button>
                            <Button size="sm" className="hidden sm:flex" asChild>
                                <Link to={'/register-account'}>Get Started</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </HeaderWrapper>
    );
}
