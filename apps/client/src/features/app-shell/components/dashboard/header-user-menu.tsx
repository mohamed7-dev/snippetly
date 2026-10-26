import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UpdateProfileIcon } from '@/components/shared/creation-icons';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import { Permission } from '@snippetly/common/dto';
import { Link, useNavigate } from '@tanstack/react-router';
import { BrushIcon, ChevronUpIcon, LibraryIcon, LogOutIcon, UsersIcon } from 'lucide-react';

export function HeaderUserMenu({ display = 'avatar' }: { display?: 'avatar' | 'sidebar' }) {
    const { user, logout, isActiveAuthMutationInProgress } = useAuth();
    const navigate = useNavigate();

    const { fullName, initials: avatarFallback } = formatDeveloperInfo({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
    });

    const handleLogout = async () => {
        await logout('developer', () => navigate({ to: '/' }));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={
                        display === 'sidebar'
                            ? 'h-auto w-full justify-start gap-3 px-2 py-2'
                            : 'hidden size-8 rounded-full lg:flex'
                    }
                >
                    <Avatar className="size-8">
                        <AvatarImage src={user?.image ?? '/placeholder.svg'} alt="User" />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                    {display === 'sidebar' && (
                        <>
                            <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                                <span className="max-w-full truncate text-sm font-semibold">{fullName}</span>
                                <span className="max-w-full truncate text-xs font-normal text-muted-foreground">
                                    {user?.emailAddress}
                                </span>
                            </span>
                            <ChevronUpIcon className="size-4 shrink-0 text-muted-foreground" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={display === 'sidebar' ? 'w-64' : 'w-56'}
                align={display === 'sidebar' ? 'start' : 'end'}
                side={display === 'sidebar' ? 'top' : 'bottom'}
                forceMount
            >
                <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.ReadDeveloper]}>
                    <DropdownMenuLabel className="font-normal">
                        <Link to="/dashboard/settings/account">
                            <div className="flex gap-2 items-center">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.image ?? '/placeholder.svg'} alt="User" />
                                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium leading-none">{fullName}</p>
                                    <p className="text-xs leading-none text-muted-foreground truncate">
                                        {user?.emailAddress}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </DropdownMenuLabel>
                </PermissionGuard>
                {!user && (
                    <DropdownMenuLabel className="font-normal">
                        <Link to="/sign-in">
                            <div className="flex gap-4 items-center">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={'/placeholder.svg'} alt="user" />
                                    <AvatarFallback>{'user'}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-1">Login</div>
                            </div>
                        </Link>
                    </DropdownMenuLabel>
                )}
                <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Button className="w-full justify-start" variant={'ghost'} asChild>
                                <Link to={'/dashboard/settings/account'}>
                                    <UpdateProfileIcon className="size-4" />
                                    <span>Profile Settings</span>
                                </Link>
                            </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Button className="w-full justify-start" variant={'ghost'} asChild>
                                <Link to={'/dashboard/settings/appearance'}>
                                    <BrushIcon />
                                    <span>Appearance Settings</span>
                                </Link>
                            </Button>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </PermissionGuard>
                <DropdownMenuItem asChild>
                    <Button className="w-full justify-start" variant={'ghost'} asChild>
                        <Link to={'/offline'}>
                            <LibraryIcon />
                            <span>Offline Library</span>
                        </Link>
                    </Button>
                </DropdownMenuItem>
                <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                    <DropdownMenuItem asChild>
                        <Button className="w-full justify-start" variant={'ghost'} asChild>
                            <Link to={'/dashboard/friends'}>
                                <UsersIcon />
                                <span>Friends</span>
                            </Link>
                        </Button>
                    </DropdownMenuItem>
                </PermissionGuard>
                <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                    <DropdownMenuItem asChild>
                        <Button
                            className="w-full justify-start"
                            variant={'ghost'}
                            disabled={isActiveAuthMutationInProgress}
                            onClick={handleLogout}
                        >
                            <LogOutIcon />
                            <span>Log out</span>
                        </Button>
                    </DropdownMenuItem>
                </PermissionGuard>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
