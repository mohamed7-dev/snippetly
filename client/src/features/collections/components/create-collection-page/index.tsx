import { PageHeader } from './page-header'
import { CreateCollectionForm } from './create-collection-form'
import { useForm } from 'react-hook-form'
import {
  createCollectionSchema,
  type CreateCollectionSchema,
} from '../../lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'

export function CreateCollectionPage() {
  const createCollectionForm = useForm<CreateCollectionSchema>({
    defaultValues: {
      title: '',
      description: '',
      color: '',
      isPublic: true,
      allowForking: true,
      tags: [],
    },
    resolver: zodResolver(createCollectionSchema),
  })
  return (
    <Form {...createCollectionForm}>
      <PageHeader />
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <CreateCollectionForm />
      </main>
    </Form>
  )
}
