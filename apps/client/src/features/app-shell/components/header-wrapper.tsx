import { cn } from '@/lib/utils'
import React from 'react'

type HeaderWrapperProps = React.ComponentProps<'header'>
export function HeaderWrapper({ className, ...rest }: HeaderWrapperProps) {
  return (
    <header
      className={cn(
        'px-2 md:px-6 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex items-center',
        className,
      )}
      {...rest}
    />
  )
}
