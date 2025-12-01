import { Button } from '@/components/ui/button'
import { HeaderUserMenu } from '@/features/app-shell/components/dashboard/header-user-menu'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

export function PageHeader() {
  const router = useRouter()
  return (
    <HeaderWrapper className="flex items-center justify-between">
      <Button variant="ghost" onClick={() => router.history.back()}>
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back
      </Button>
      <HeaderUserMenu />
    </HeaderWrapper>
  )
}
