import React from 'react'
import { toast } from 'sonner'

type UseCopyCodeProps = {
  code: string
}
export function useCopyCode({ code }: UseCopyCodeProps) {
  const [isCopied, setIsCopied] = React.useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true)
      toast.info('Snippet code is copied to the clipboard.')
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  return { copyCode, isCopied }
}
