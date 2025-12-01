import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { UserPlusIcon } from 'lucide-react'

export function MainContentHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Friend Requests</h1>
        <p className="text-muted-foreground">
          Manage your incoming and outgoing friend requests
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link to="/dashboard/discover">
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Find Friends
          </Link>
        </Button>
      </div>
    </div>
  )
}
