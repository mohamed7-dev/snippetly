import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import { Permission } from '@snippetly/common/dto';
import { Link, useNavigate } from '@tanstack/react-router';
import { ChevronUpIcon, LogOutIcon, Settings2Icon, UserRoundIcon } from 'lucide-react';

export function DashboardSidebarFooter() {
    const { user, logout, isActiveAuthMutationInProgress } = useAuth();
    const navigate = useNavigate();
    const { fullName, initials } = formatDeveloperInfo({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
    });

    const handleSignOut = async () => {
        await logout('developer', () => navigate({ to: '/' }));
    };

    return (
        <footer className="space-y-2 border-t border-border p-4">
            <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/dashboard/settings">
                        <Settings2Icon />
                        <span>Settings</span>
                    </Link>
                </Button>
            </PermissionGuard>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-auto w-full justify-start gap-3 px-2 py-2"
                        aria-label={user ? `User menu for ${fullName}` : 'User menu'}
                    >
                        <Avatar className="size-9 ring-2 ring-primary/15">
                            <AvatarImage src={user?.image ?? undefined} alt={fullName} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {user ? initials : <UserRoundIcon className="size-4" />}
                            </AvatarFallback>
                        </Avatar>
                        <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                            <span className="max-w-full truncate text-sm font-semibold">
                                {user ? fullName : 'Welcome to Snippetly'}
                            </span>
                            <span className="max-w-full truncate text-xs font-normal text-muted-foreground">
                                {user?.emailAddress ?? 'Sign in to your account'}
                            </span>
                        </span>
                        <ChevronUpIcon className="size-4 shrink-0 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-64">
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center gap-3 py-1">
                            <Avatar className="size-10">
                                <AvatarImage src={user?.image ?? undefined} alt={fullName} />
                                <AvatarFallback>
                                    {user ? initials : <UserRoundIcon className="size-4" />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col gap-1">
                                <span className="truncate text-sm font-semibold">
                                    {user ? fullName : 'Your Snippetly account'}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {user?.emailAddress ?? 'Save and organize your snippets'}
                                </span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                        <DropdownMenuItem
                            disabled={isActiveAuthMutationInProgress}
                            onSelect={event => {
                                event.preventDefault();
                                void handleSignOut();
                            }}
                            className="text-destructive focus:text-destructive"
                        >
                            <LogOutIcon />
                            <span>{isActiveAuthMutationInProgress ? 'Signing out…' : 'Sign out'}</span>
                        </DropdownMenuItem>
                    </PermissionGuard>
                    {!user && (
                        <DropdownMenuItem asChild>
                            <Link to="/sign-in">
                                <UserRoundIcon />
                                <span>Sign in</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </footer>
    );
}
