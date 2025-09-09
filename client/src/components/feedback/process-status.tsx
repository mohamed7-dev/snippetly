'use client'
import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  OctagonAlertIcon,
  XIcon,
} from 'lucide-react'

type ProcessStatusProps = {
  title: string
  description: string | React.ReactElement
  duration?: number | false
  onClose?: () => void
  showCloseButton?: boolean
  variant?: React.ComponentProps<typeof Alert>['variant'] | 'info' | 'warning'
} & Omit<React.ComponentProps<typeof Alert>, 'variant'>

export function ProcessStatus(props: ProcessStatusProps) {
  const {
    title,
    description,
    variant = 'default',
    duration = false,
    showCloseButton = true,
    onClose,
    className,
    ...rest
  } = props

  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    let timer: NodeJS.Timeout
    if (duration) {
      const defaultDuration = 1000
      timer = setTimeout(() => {
        setVisible(false)
        if (onClose) onClose()
      }, defaultDuration)
    }
    return () => clearTimeout(timer)
  }, [duration, onClose])
  if (!visible) return null

  // from styling point of view we only have two variants
  // but for icons we need more control
  const defaultVariant =
    variant === 'default' || variant === 'info' ? 'default' : 'destructive'
  return (
    <Alert
      variant={defaultVariant}
      className={cn('space-y-4 relative', className)}
      {...rest}
    >
      {!duration && showCloseButton && (
        <Button
          variant={'ghost'}
          size={'icon'}
          type="button"
          className="absolute top-2 right-2"
          onClick={() => setVisible(false)}
        >
          <XIcon />
          <span className="sr-only">close alert message</span>
        </Button>
      )}

      <AlertTitle className="flex items-center gap-2">
        {variant === 'default' && <CheckCircleIcon className="size-4" />}
        {variant === 'destructive' && <AlertCircleIcon className="size-4" />}
        {variant === 'info' && <InfoIcon className="size-4" />}
        {variant === 'warning' && <OctagonAlertIcon className="size-4" />}
        {title}
      </AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}
