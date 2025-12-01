import { Button } from '@/components/ui/button'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, EyeIcon, SaveIcon } from 'lucide-react'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { CreateSnippetSchema } from '../../lib/schema'
import { LoadingButton } from '@/components/inputs/loading-button'
import { CREATE_SNIPPET_FORM } from './create-snippet-form'

export function PageHeader() {
  const createSnippetForm: UseFormReturn<CreateSnippetSchema> = useFormContext()
  const isValid = createSnippetForm.formState.isValid
  const isSubmitting = createSnippetForm.formState.isSubmitting

  return (
    <HeaderWrapper className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="font-heading font-semibold text-lg">
          Create New Snippet
        </h1>
      </div>

      <div className="w-full sm:w-auto flex items-center justify-center gap-3">
        <Button variant="outline" size="sm" disabled={isSubmitting || !isValid}>
          <EyeIcon className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <LoadingButton
          disabled={isSubmitting || !isValid}
          isLoading={isSubmitting}
          size="sm"
          type="submit"
          form={CREATE_SNIPPET_FORM}
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          Create Snippet
        </LoadingButton>
      </div>
    </HeaderWrapper>
  )
}
