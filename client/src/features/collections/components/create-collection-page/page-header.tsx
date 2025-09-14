import { Button } from '@/components/ui/button'
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, EyeIcon, SaveIcon } from 'lucide-react'
import { useFormContext, type UseFormReturn } from 'react-hook-form'
import type { CreateCollectionSchema } from '../../lib/schema'
import { LoadingButton } from '@/components/inputs/loading-button'
import { CREATE_COLLECTION_FORM_NAME } from './create-collection-form'

export function PageHeader() {
  const createCollectionForm: UseFormReturn<CreateCollectionSchema> =
    useFormContext()
  const isValid = createCollectionForm.formState.isValid
  const isSubmitting = createCollectionForm.formState.isSubmitting

  return (
    <HeaderWrapper className="px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link
            to={'/dashboard/collections'}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Collections
          </Link>
        </Button>
        <h1 className="font-heading font-semibold text-lg">
          Create New Collection
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant={'outline'}
          size="sm"
          disabled={isSubmitting || !isValid}
        >
          <EyeIcon className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <LoadingButton
          disabled={isSubmitting || !isValid}
          isLoading={isSubmitting}
          size="sm"
          type="submit"
          form={CREATE_COLLECTION_FORM_NAME}
        >
          <SaveIcon className="h-4 w-4 mr-2" />
          Create Collection
        </LoadingButton>
      </div>
    </HeaderWrapper>
  )
}
