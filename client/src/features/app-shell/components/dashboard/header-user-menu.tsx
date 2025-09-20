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
import { toast } from 'sonner'

export function HeaderUserMenu() {
  const navigate = useNavigate()

  const { logout: logoutOnClient, getCurrentUser } = useAuth()
  const user = getCurrentUser()
  const { mutateAsync: logout, isPending } = useLogout({
    onSuccess: (data) => {
      toast.success(data.message)
      navigate({ from: '/dashboard', to: '/' })
      logoutOnClient()
    },
    onError: (error) => {
      toast.error(error.response?.statusText, {
        description: error.response?.data.message,
      })
    },
  })

  const handleLogout = async () => {
    await logout()
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? '/placeholder.svg'} alt="User" />
            <AvatarFallback>{user?.name?.slice(0, 1)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <Link to="/dashboard/settings/profile">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.name ?? ''}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Link to="/dashboard/friends" className="flex items-center">
            <UsersIcon className="mr-2 h-4 w-4" />
            <span>Friends</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isPending} onClick={handleLogout}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
