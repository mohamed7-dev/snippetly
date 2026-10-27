import z from 'zod';
import type { CreateSnippetFormSchemaType } from './schema';

const STORAGE_KEY = 'snippetly:create-snippet-draft';

const snippetDraftSchema = z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    note: z.string().nullable().optional(),
    code: z.string().optional(),
    language: z.string().optional(),
    isPrivate: z.boolean().optional(),
    allowForking: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    collectionId: z.string().optional(),
});

export function loadSnippetDraft(): Partial<CreateSnippetFormSchemaType> | undefined {
    const serializedDraft = sessionStorage.getItem(STORAGE_KEY);
    if (!serializedDraft) return undefined;

    let draft: unknown;
    try {
        draft = JSON.parse(serializedDraft);
    } catch (error) {
        console.error('Unable to parse the saved snippet draft.', error);
        sessionStorage.removeItem(STORAGE_KEY);
        return undefined;
    }

    const result = snippetDraftSchema.safeParse(draft);
    if (!result.success) {
        console.error('The saved snippet draft has an invalid shape.', result.error);
        sessionStorage.removeItem(STORAGE_KEY);
        return undefined;
    }

    return result.data;
}

export function saveSnippetDraft(draft: Partial<CreateSnippetFormSchemaType>) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearSnippetDraft() {
    sessionStorage.removeItem(STORAGE_KEY);
}
