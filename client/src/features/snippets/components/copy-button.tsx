import { Button } from '@/components/ui/button'
import { CopyCheckIcon, CopyIcon } from 'lucide-react'
import { useCopyCode } from '../hooks/use-copy-code'

type CopyButtonProps = React.ComponentProps<typeof Button> & {
  code: string
}
export function CopyButton({ code, children, ...props }: CopyButtonProps) {
  const { copyCode, isCopied } = useCopyCode({ code })
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    copyCode()
    props?.onClick?.(e)
  }
  return (
    <Button variant="outline" size="sm" {...props} onClick={handleClick}>
      {children ? (
        children
      ) : (
        <>
          {isCopied ? (
            <CopyCheckIcon className="h-4 w-4 mr-2" />
          ) : (
            <CopyIcon className="h-4 w-4 mr-2" />
          )}
          {isCopied ? 'Copied' : 'Copy Code'}
        </>
      )}
    </Button>
  )
}
