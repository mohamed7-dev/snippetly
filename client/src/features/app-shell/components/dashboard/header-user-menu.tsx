import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from '@tanstack/react-router'
import { LogOutIcon, UsersIcon } from 'lucide-react'
import { useAuth } from '@/features/auth/components/auth-provider'
import { useLogout } from '@/features/auth/hooks/use-logout'

export function HeaderUserMenu() {
  const { getCurrentUser } = useAuth()
  const user = getCurrentUser()
  const navigate = useNavigate()

  // logout
  const { mutateAsync: logout, isPending } = useLogout()
  const handleLogout = async () => {
    if (!user) {
      return navigate({
        to: '/login',
      })
    }
    await logout()
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full hidden lg:flex"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? '/placeholder.svg'} alt="User" />
            <AvatarFallback>{user?.name?.slice(0, 1) ?? 'user'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {user ? (
          <DropdownMenuLabel className="font-normal">
            <Link to="/dashboard/settings/profile">
              <div className="flex gap-4 items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.image ?? '/placeholder.svg'}
                    alt="User"
                  />
                  <AvatarFallback>
                    {user?.name?.slice(0, 1) ?? 'user'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name ?? ''}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </Link>
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel className="font-normal">
            <Link to="/login">
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

        <DropdownMenuItem>
          <Link
            to={user ? '/dashboard/friends' : '/login'}
            className="flex items-center"
          >
            <UsersIcon className="mr-2 h-4 w-4" />
            <span>Friends</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem disabled={isPending} onClick={handleLogout}>
            <LogOutIcon className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Link to={'/login'} className="flex items-center">
              <UsersIcon className="mr-2 h-4 w-4" />
              <span>Login</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
