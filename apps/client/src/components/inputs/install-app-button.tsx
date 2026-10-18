import React from 'react';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { Button } from '../ui/button';
import { DownloadIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  className?: string
  children?: React.ReactNode
  size?: React.ComponentProps<typeof Button>['size']
}

export function InstallAppButton({ className, children, size }: Props) {
  const { supportsInstall, isInstalled, promptInstall } = useInstallPrompt()
  if (isInstalled || !supportsInstall) return null

  return (
    <Button
      type="button"
      variant={'outline'}
      size={size}
      onClick={() => {
        void promptInstall()
      }}
      className={cn('hover:text-muted-foreground', className)}
      title="Install this app"
    >
      {children ?? (
        <React.Fragment>
          <DownloadIcon />
          <span>Install App</span>
        </React.Fragment>
      )}
    </Button>
  )
}
