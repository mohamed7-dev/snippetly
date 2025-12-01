import { cn } from '@/lib/utils'
import { LoaderPinwheelIcon } from 'lucide-react'

type PageLoaderProps = {
  containerProps?: React.ComponentProps<'main'>
  iconProps?: React.ComponentProps<'svg'>
}
export function PageLoader({ containerProps, iconProps }: PageLoaderProps) {
  const { className: iconClassName, ...iconRest } = iconProps || {
    className: '',
  }
  const { className: containerClassName, ...containerRest } =
    containerProps || { className: '' }

  return (
    <main
      className={cn(
        'size-full flex items-center justify-center',
        containerClassName,
      )}
      {...containerRest}
    >
      <LoaderPinwheelIcon
        className={cn('size-10 stroke-primary animate-spin', iconClassName)}
        {...iconRest}
      />
    </main>
  )
}
