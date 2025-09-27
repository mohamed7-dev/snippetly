import { Button } from '@/components/ui/button'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { Logo } from '@/features/app-shell/components/logo'
import { Link } from '@tanstack/react-router'

export function PageHeader() {
  return (
    <HeaderWrapper className="gap-4">
      <Logo />
      <Button variant="ghost" size="sm" asChild>
        <Link to="/offline" className="flex items-center gap-2">
          Back to Offline Library
        </Link>
      </Button>
    </HeaderWrapper>
  )
}
