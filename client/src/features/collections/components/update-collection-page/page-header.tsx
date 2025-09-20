import { Button } from '@/components/ui/button'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeftIcon, EyeIcon, SaveIcon, Trash2Icon } from 'lucide-react'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { UpdateCollectionSchema } from '../../lib/schema'
import { LoadingButton } from '@/components/inputs/loading-button'
import { UPDATE_COLLECTION_FORM_NAME } from './update-collection-form'
import { useDeleteCollection } from '../../hooks/use-delete-collection'
import { useDeleteConfirmation } from '@/components/providers/delete-confirmation-provider'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getCollectionQueryOptions } from '../../lib/api'

export function PageHeader() {
  const { slug } = useParams({
    from: '/(protected)/dashboard/collections/$slug/edit',
  })
  const {
    data: { data: collection },
  } = useSuspenseQuery(getCollectionQueryOptions(slug))

  const updateCollectionForm: UseFormReturn<UpdateCollectionSchema> =
    useFormContext()
  const isValid = updateCollectionForm.formState.isValid
  const isSubmitting = updateCollectionForm.formState.isSubmitting

  // delete
  const { mutateAsync: deleteCollection, isPending: isDeleting } =
    useDeleteCollection()

  const { confirm } = useDeleteConfirmation()

  const handleDelete = () => {
    confirm({
      title: `Delete Collection ${collection.title}`,
      onConfirm: async () => {
        await deleteCollection({ slug })
      },
    })
  }
  return (
    <HeaderWrapper className="px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            to={'/dashboard/collections/$slug'}
            params={{ slug }}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back To Collection
          </Link>
        </Button>
        <h1 className="font-heading font-semibold text-lg">
          Update Collection
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={'outline'}
          size="sm"
          disabled={isSubmitting || !isValid}
        >
          <Link
            to={'/dashboard/collections/$slug'}
            params={{ slug }}
            className="flex items-center gap-2"
          >
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
          disabled={isSubmitting || !isValid}
          isLoading={isSubmitting}
          size="sm"
          type="submit"
          form={UPDATE_COLLECTION_FORM_NAME}
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          Save Changes
        </LoadingButton>
      </div>
    </HeaderWrapper>
  )
}
