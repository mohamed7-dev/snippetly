import { Button } from '@/components/ui/button'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

export function PageHeader() {
  return (
    <HeaderWrapper className="gap-4">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
      <h1>Offline Snippets</h1>
    </HeaderWrapper>
  )
}
