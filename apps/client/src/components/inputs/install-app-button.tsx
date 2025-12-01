import React from 'react'
import { useInstallPrompt } from '@/hooks/use-install-prompt'
import { Button } from '../ui/button'
import { CodeIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  children?: React.ReactNode
}

export function InstallAppButton({ className, children }: Props) {
  const { supportsInstall, isInstalled, promptInstall } = useInstallPrompt()
  if (isInstalled || !supportsInstall) return null

  return (
    <Button
      type="button"
      variant={'outline'}
      onClick={promptInstall}
      className={cn('hover:text-muted-foreground', className)}
      title="Install this app"
    >
      {children ?? (
        <React.Fragment>
          <CodeIcon />
          <span>Install App</span>
        </React.Fragment>
      )}
    </Button>
  )
}
