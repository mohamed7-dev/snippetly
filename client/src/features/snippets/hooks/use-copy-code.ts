import React from 'react'

type UseCopyCodeProps = {
  code: string
}
export function useCopyCode({ code }: UseCopyCodeProps) {
  const [isCopied, setIsCopied] = React.useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }

  return { copyCode, isCopied }
}
