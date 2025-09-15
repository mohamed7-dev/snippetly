import React from 'react'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { CreateSnippetSchema } from '../../lib/schema'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

export function CodeEditorField() {
  const createSnippetForm: UseFormReturn<CreateSnippetSchema> = useFormContext()

  const handleCodeTextAreaKeydown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      if (e.shiftKey === false) {
        target.value =
          target.value.substring(0, start) +
          '\t' +
          target.value.substring(start)
        target.selectionStart = target.selectionEnd = start + 1
      } else {
        target.value =
          target.value.substring(0, start - 1) + target.value.substring(start)
        target.selectionStart = target.selectionEnd = start - 1
      }
    }
  }

  return (
    <FormField
      control={createSnippetForm.control}
      name="code"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Your Code</FormLabel>
          <FormControl>
            <Textarea
              onKeyDown={handleCodeTextAreaKeydown}
              spellCheck={false}
              className="size-full caret-primary font-mono text-sm resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
          <FormDescription>Use Tab to indent</FormDescription>
        </FormItem>
      )}
    />
  )
}
