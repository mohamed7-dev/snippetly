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
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Link, useNavigate } from '@tanstack/react-router';
import { BrushIcon, LibraryIcon, LogOutIcon, UserCog2Icon, UsersIcon } from 'lucide-react';

export function HeaderUserMenu() {
    const { isAuthenticated, user, logout, status, isActiveAuthMutationInProgress } = useAuth();
    const navigate = useNavigate();

    const isPending = status === 'authenticated' && isActiveAuthMutationInProgress;

    // logout
    const handleLogout = async () => {
        if (!isAuthenticated) {
            return navigate({
                to: '/sign-in',
            });
        }
        await logout('developer', () => navigate({ to: '/' }));
    };

    const avatarFallback = user?.firstName?.slice(0, 1) + ' ' + user?.lastName?.slice(0, 1);
    const userFullName = user?.firstName + ' ' + user?.lastName;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hidden lg:flex">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image ?? '/placeholder.svg'} alt="User" />
                        <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                {user ? (
                    <DropdownMenuLabel className="font-normal">
                        <Link to="/dashboard/settings/profile">
                            <div className="flex gap-4 items-center">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.image ?? '/placeholder.svg'} alt="User" />
                                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium leading-none">{userFullName}</p>
                                    <p className="text-xs leading-none text-muted-foreground truncate">
                                        {user?.emailAddress}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </DropdownMenuLabel>
                ) : (
                    <DropdownMenuLabel className="font-normal">
                        <Link to="/sign-in">
                            <div className="flex gap-4 items-center">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={'/placeholder.svg'} alt="User" />
                                    <AvatarFallback>{'user'}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-1">Get Started</div>
                            </div>
                        </Link>
                    </DropdownMenuLabel>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Button className="w-full justify-start" variant={'ghost'} asChild>
                            <Link to={'/dashboard/settings/profile'}>
                                <UserCog2Icon className="mr-2 h-4 w-4" />
                                <span>Profile Settings</span>
                            </Link>
                        </Button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Button className="w-full justify-start" variant={'ghost'} asChild>
                            <Link to={'/dashboard/settings/appearance'}>
                                <BrushIcon className="mr-2 h-4 w-4" />
                                <span>Appearance Settings</span>
                            </Link>
                        </Button>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Button className="w-full justify-start" variant={'ghost'} asChild>
                        <Link to={'/offline'}>
                            <LibraryIcon className="mr-2 h-4 w-4" />
                            <span>Offline Library</span>
                        </Link>
                    </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Button className="w-full justify-start" variant={'ghost'} asChild>
                        <Link to={user ? '/dashboard/friends' : '/sign-in'}>
                            <UsersIcon className="mr-2 h-4 w-4" />
                            <span>Friends</span>
                        </Link>
                    </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user ? (
                    <DropdownMenuItem disabled={isPending} onClick={handleLogout}>
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem>
                        <Link to={'/sign-in'} className="flex items-center">
                            <UsersIcon className="mr-2 h-4 w-4" />
                            <span>Login</span>
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
