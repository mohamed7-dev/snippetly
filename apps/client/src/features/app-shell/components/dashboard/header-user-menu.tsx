import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
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
import { BrushIcon, LibraryIcon, LogOutIcon, UserCog2Icon, UsersIcon } from 'lucide-react';

export function HeaderUserMenu() {
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
                <Button variant="ghost" className="size-8 rounded-full hidden lg:flex">
                    <Avatar className="size-8">
                        <AvatarImage src={user?.image ?? '/placeholder.svg'} alt="User" />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <PermissionGuard requiredPermissions={[Permission.Authenticated, Permission.ReadDeveloper]}>
                    <DropdownMenuLabel className="font-normal">
                        <Link to="/dashboard/settings/profile">
                            <div className="flex gap-4 items-center">
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
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Button className="w-full justify-start" variant={'ghost'} asChild>
                                <Link to={'/dashboard/settings/profile'}>
                                    <UserCog2Icon />
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
                <DropdownMenuSeparator />
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
                <DropdownMenuSeparator />
                <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                    <DropdownMenuItem disabled={isActiveAuthMutationInProgress} onClick={handleLogout}>
                        <LogOutIcon />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </PermissionGuard>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
