import React from 'react'

type UseEnterTagProps = {
  tags?: string[]
  onValueChange: (tag: string) => void
  inputElem: React.RefObject<HTMLInputElement | null>
}
export function useEnterTag({
  tags,
  onValueChange,
  inputElem,
}: UseEnterTagProps) {
  React.useEffect(() => {
    const inputEl = inputElem.current
    if (!inputEl) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault() // prevent form submit
        const value = inputEl.value.trim()
        if (value && !tags?.includes(value)) {
          onValueChange(value)
        }
      }
    }

    inputEl.addEventListener('keydown', handleKeyDown)
    return () => {
      inputEl.removeEventListener('keydown', handleKeyDown)
    }
  }, [onValueChange, tags])
}
