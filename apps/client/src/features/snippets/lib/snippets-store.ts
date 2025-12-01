import { withStore, DB_VERSION } from '@/lib/offline-store/indexeddb'
import type { Snippet } from './types'

export const SNIPPETS_OFFLINE_DB_NAME = 'snippetly-offline'

export const SNIPPETS_STORE = 'saved-snippets'

export type SavedSnippetMeta = Pick<
  Snippet,
  | 'publicId'
  | 'title'
  | 'code'
  | 'creatorName'
  | 'language'
  | 'description'
  | 'note'
> & {
  // Internal keyPath used by IndexedDB store (mapped from publicId)
  id?: string
  tags?: string[]
  savedAt?: number
}

export async function addSavedSnippet(meta: SavedSnippetMeta): Promise<void> {
  await withStore(
    SNIPPETS_STORE,
    'readwrite',
    async (store) => {
      const value: SavedSnippetMeta = {
        ...meta,
        // Ensure the store keyPath 'id' is present; map it to publicId
        id: meta.publicId,
        savedAt: meta.savedAt ?? Date.now(),
      }
      store.put(value)
    },
    SNIPPETS_OFFLINE_DB_NAME,
    DB_VERSION,
  )
}

// Pass the snippet publicId here; it is stored under the keyPath 'id'
export async function removeSavedSnippet(id: string): Promise<void> {
  await withStore(
    SNIPPETS_STORE,
    'readwrite',
    async (store) => {
      store.delete(id)
    },
    SNIPPETS_OFFLINE_DB_NAME,
    DB_VERSION,
  )
}

export async function getSavedSnippet(
  id: string,
): Promise<SavedSnippetMeta | undefined> {
  return await withStore(
    SNIPPETS_STORE,
    'readonly',
    async (store) => {
      return await new Promise<SavedSnippetMeta | undefined>(
        (resolve, reject) => {
          const req = store.get(id)
          req.onsuccess = () =>
            resolve(req.result as SavedSnippetMeta | undefined)
          req.onerror = () => reject(req.error)
        },
      )
    },
    SNIPPETS_OFFLINE_DB_NAME,
    DB_VERSION,
  )
}

export async function getAllSavedSnippets(): Promise<SavedSnippetMeta[]> {
  return await withStore(
    SNIPPETS_STORE,
    'readonly',
    async (store) => {
      return await new Promise<SavedSnippetMeta[]>((resolve, reject) => {
        const req = store.getAll()
        req.onsuccess = () => resolve((req.result as SavedSnippetMeta[]) ?? [])
        req.onerror = () => reject(req.error)
      })
    },
    SNIPPETS_OFFLINE_DB_NAME,
    DB_VERSION,
  )
}

export async function updateSavedSnippet(
  patch: Partial<SavedSnippetMeta> & { publicId: string },
): Promise<void> {
  await withStore(
    SNIPPETS_STORE,
    'readwrite',
    async (store) => {
      const current = await new Promise<SavedSnippetMeta | undefined>(
        (resolve, reject) => {
          const req = store.get(patch.publicId)
          req.onsuccess = () =>
            resolve(req.result as SavedSnippetMeta | undefined)
          req.onerror = () => reject(req.error)
        },
      )
      if (!current) return
      const updated: SavedSnippetMeta = {
        ...current,
        // Map allowed fields if provided in patch
        title: patch.title ?? current.title,
        code: patch.code ?? current.code,
        language: patch.language ?? current.language,
        description: patch.description ?? current.description,
        creatorName: patch.creatorName ?? current.creatorName,
        note: patch.note ?? current.note,
        // Preserve identifiers and timestamps
        publicId: current.publicId,
        id: current.id ?? current.publicId,
        savedAt: current.savedAt ?? Date.now(),
        tags: patch.tags ?? current.tags,
      }
      store.put(updated)
    },
    SNIPPETS_OFFLINE_DB_NAME,
    DB_VERSION,
  )
}
