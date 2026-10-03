import { LoadingButton } from '@/components/inputs/loading-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Link } from '@tanstack/react-router';
import { LogOutIcon } from 'lucide-react';

export function MobileSidebarFooter() {
    const { user, logout, isActiveAuthMutationInProgress, status } = useAuth();
    const isPending = status === 'authenticated' && isActiveAuthMutationInProgress;
    // logout
    const fallback = user?.firstName.slice(0, 1) + ' ' + user?.lastName.slice(0, 1);
    return (
        <div className="w-full space-y-2">
            {!!user && (
                <Button size={'lg'} className="w-full" variant={'outline'} asChild>
                    <Link to="/dashboard/settings/profile">
                        <Avatar className="size-6">
                            <AvatarImage src={user.image ?? '/placeholder'} alt={fallback} />
                            <AvatarFallback>{fallback}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{user.emailAddress}</span>
                    </Link>
                </Button>
            )}
            {!user && (
                <Button size={'lg'} className="w-full" variant={'outline'} asChild>
                    <Link to="/sign-in">Start here</Link>
                </Button>
            )}
            <LoadingButton
                isLoading={isPending}
                className="w-full"
                variant={'outline'}
                disabled={isPending}
                onClick={() => logout('developer')}
            >
                <LogOutIcon />
                <span>Logout</span>
            </LoadingButton>
        </div>
    );
}
