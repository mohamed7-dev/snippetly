import { LoadingButton } from '@/components/inputs/loading-button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useLogout } from '@/features/auth/hooks/use-logout'
import { Link } from '@tanstack/react-router'
import { LogOutIcon } from 'lucide-react'

export function MobileSidebarFooter() {
  const { getCurrentUser } = useAuth()
  const user = getCurrentUser()
  // logout
  const { mutateAsync: logout, isPending } = useLogout()
  return (
    <div className="w-full space-y-2">
      {!!user && (
        <Button size={'lg'} className="w-full" variant={'outline'} asChild>
          <Link to="/dashboard/settings/profile">
            <Avatar className="size-6">
              <AvatarImage src={user.image ?? '/placeholder'} alt={user.name} />
              <AvatarFallback>{user.name}</AvatarFallback>
            </Avatar>
            <span className="truncate">{user.email}</span>
          </Link>
        </Button>
      )}
      {!!!user && (
        <Button size={'lg'} className="w-full" variant={'outline'} asChild>
          <Link to="/login">Start here</Link>
        </Button>
      )}
      <LoadingButton
        isLoading={isPending}
        className="w-full"
        variant={'outline'}
        disabled={isPending}
        onClick={() => logout()}
      >
        <LogOutIcon />
        <span>Logout</span>
      </LoadingButton>
    </div>
  )
}
