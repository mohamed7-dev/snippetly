import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { editSnippetSchema, type EditSnippetSchema } from '../../lib/schema'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getSnippetQueryOptions } from '../../lib/api'
import { useParams } from '@tanstack/react-router'
import { Form } from '@/components/ui/form'
import { PageHeader } from './page-header'
import { EditSnippetForm } from './edit-snippet-form'

export function EditSnippetPage() {
  const { slug } = useParams({
    from: '/(protected)/dashboard/snippets/$slug/edit',
  })
  const { data } = useSuspenseQuery(getSnippetQueryOptions(slug))
  const snippet = data.data
  const editSnippetForm = useForm<EditSnippetSchema>({
    defaultValues: {
      title: snippet.title,
      description: snippet.description ?? '',
      allowForking: snippet.allowForking,
      isPublic: !snippet.isPrivate,
      note: snippet.note ?? '',
      language: snippet.language,
      code: snippet.code,
      collection: snippet.collection.publicId,
      addTags: [],
      removeTags: [],
    },
    resolver: zodResolver(editSnippetSchema),
  })
  return (
    <Form {...editSnippetForm}>
      <PageHeader />
      <main className="container mx-auto px-3 md:px-6 py-8 max-w-4xl">
        <EditSnippetForm />
      </main>
    </Form>
  )
}
