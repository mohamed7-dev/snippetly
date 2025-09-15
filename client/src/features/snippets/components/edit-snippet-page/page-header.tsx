import { Button } from '@/components/ui/button'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon, EyeIcon, SaveIcon, Trash2Icon } from 'lucide-react'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { EditSnippetSchema } from '../../lib/schema'
import { LoadingButton } from '@/components/inputs/loading-button'
import { EDIT_SNIPPET_FORM_NAME } from './edit-snippet-form'
import { useDeleteSnippet } from '../../hooks/use-delete-snippet'
import { useDeleteConfirmation } from '@/components/providers/delete-confirmation-provider'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getSnippetQueryOptions } from '../../lib/api'

export function PageHeader() {
  const params = useParams({
    from: '/(protected)/dashboard/snippets/$slug/edit',
  })
  const {
    data: { data: snippet },
  } = useSuspenseQuery(getSnippetQueryOptions(params.slug))

  const editSnippetForm: UseFormReturn<EditSnippetSchema> = useFormContext()
  const isSubmitting = editSnippetForm.formState.isSubmitting
  const isValid = editSnippetForm.formState.isValid

  const { mutateAsync: deleteSnippet, isPending: isDeleting } =
    useDeleteSnippet()

  const { confirm } = useDeleteConfirmation()

  const handleDelete = () => {
    confirm({
      title: `Delete snippet ${snippet.title}`,
      onConfirm: async () => {
        await deleteSnippet({ slug: params.slug })
      },
    })
  }
  return (
    <HeaderWrapper className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            to={'/dashboard/snippets/$slug'}
            params={{ slug: params.slug }}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Snippet
          </Link>
        </Button>
        <h1 className="font-heading font-semibold text-lg">Edit Snippet</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to="/dashboard/snippets/$slug" params={{ slug: params.slug }}>
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview
          </Link>
        </Button>
        <LoadingButton
          isLoading={isDeleting}
          variant="destructive-outline"
          size="sm"
          onClick={handleDelete}
        >
          <Trash2Icon className="h-4 w-4 mr-2" />
          Delete
        </LoadingButton>
        <LoadingButton
          isLoading={isSubmitting}
          size="sm"
          disabled={!isValid || isSubmitting}
          type="submit"
          form={EDIT_SNIPPET_FORM_NAME}
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          Save Changes
        </LoadingButton>
      </div>
    </HeaderWrapper>
  )
}
