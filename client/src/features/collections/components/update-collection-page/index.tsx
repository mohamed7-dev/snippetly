import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { getCollectionQueryOptions } from '../../lib/api'
import { useForm } from 'react-hook-form'
import {
  updateCollectionSchema,
  type UpdateCollectionSchema,
} from '../../lib/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { UpdateCollectionForm } from './update-collection-form'
import { PageHeader } from './page-header'

export function UpdateCollectionPage() {
  const { slug } = useParams({
    from: '/(protected)/dashboard/collections/$slug/edit',
  })
  const { data } = useSuspenseQuery(getCollectionQueryOptions(slug))
  const collection = data.data
  const updateCollectionForm = useForm<UpdateCollectionSchema>({
    defaultValues: {
      title: collection.title,
      description: collection.description ?? '',
      color: collection.color ?? '',
      allowForking: collection.allowForking,
      isPublic: !collection.isPrivate,
      addTags: [],
      removeTags: [],
    },
    resolver: zodResolver(updateCollectionSchema),
  })
  return (
    <Form {...updateCollectionForm}>
      <PageHeader />
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <UpdateCollectionForm />
      </main>
    </Form>
  )
}
