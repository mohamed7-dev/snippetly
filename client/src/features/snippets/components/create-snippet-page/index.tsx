import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createSnippetSchema, type CreateSnippetSchema } from '../../lib/schema'
import { Form } from '@/components/ui/form'
import { PageHeader } from './page-header'
import { CreateSnippetForm } from './create-snippet-form'

export function CreateSnippetPage() {
  const createSnippetForm = useForm<CreateSnippetSchema>({
    defaultValues: {
      title: '',
      description: '',
      code: '',
      language: '',
      isPrivate: false,
      allowForking: true,
    },
    resolver: zodResolver(createSnippetSchema),
  })
  return (
    <Form {...createSnippetForm}>
      <PageHeader />
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <CreateSnippetForm />
      </main>
    </Form>
  )
}
