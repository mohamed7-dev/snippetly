import { LoadingButton } from '@/components/inputs/loading-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import { Permission } from '@snippetly/common/dto';
import { Link, useNavigate } from '@tanstack/react-router';
import { LogOutIcon } from 'lucide-react';

export function MobileSidebarFooter() {
    const { user, status, logout, isActiveAuthMutationInProgress } = useAuth();
    const navigate = useNavigate();
    // logout
    const { initials } = formatDeveloperInfo({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
    });
    return (
        <div className="w-full space-y-2">
            {!!user && (
                <Button size={'lg'} className="w-full" variant={'outline'} asChild>
                    <Link to="/dashboard/settings/account">
                        <Avatar className="size-8">
                            <AvatarImage src={user.image ?? '/placeholder'} alt={initials} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{user.emailAddress}</span>
                    </Link>
                </Button>
            )}
            <Button size={'lg'} className="w-full" variant={'outline'} asChild>
                <Link to="/dashboard">Exit to dashboard</Link>
            </Button>
            {status !== 'authenticated' && (
                <Button size={'lg'} className="w-full" variant={'outline'} asChild>
                    <Link to="/sign-in">Start here</Link>
                </Button>
            )}
            <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                <LoadingButton
                    isLoading={isActiveAuthMutationInProgress}
                    className="w-full"
                    variant={'destructive-outline'}
                    disabled={isActiveAuthMutationInProgress}
                    onClick={() => logout('developer', () => navigate({ to: '/' }))}
                >
                    <LogOutIcon />
                    <span>Logout</span>
                </LoadingButton>
            </PermissionGuard>
        </div>
    );
}
