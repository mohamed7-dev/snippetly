import type { ApiSuccess } from '@/lib/api-client';
import { DB_VERSION, withStore } from '@/lib/offline-store/indexeddb';
import type { SnippetListDtoType } from '@snippetly/common/dto';
import { APP_NAME } from '@snippetly/common/lib';

export const SNIPPETS_OFFLINE_DB_NAME = `${APP_NAME.toLowerCase()}-offline`;

export const SNIPPETS_STORE = 'saved-snippets';

export interface OfflineSnippetItem extends Pick<
    ApiSuccess<SnippetListDtoType['output']>['items'][number],
    'name' | 'code' | 'language' | 'creator' | 'id' | 'description' | 'note' | 'tags' | 'slug'
> {
    savedAt: Date;
}

export type InsertOfflineSnippetInput = Omit<OfflineSnippetItem, 'savedAt'>;

export async function insertOfflineSnippet(snippet: InsertOfflineSnippetInput): Promise<void> {
    await withStore(
        SNIPPETS_STORE,
        'readwrite',
        async store => {
            const current = await new Promise<OfflineSnippetItem | undefined>((resolve, reject) => {
                const req = store.get(snippet.id);
                req.onsuccess = () => resolve(req.result as OfflineSnippetItem | undefined);
                req.onerror = () => reject(req.error);
            });
            if (current) return;
            const value: OfflineSnippetItem = {
                ...snippet,
                savedAt: new Date(),
            };
            store.put(value);
        },
        SNIPPETS_OFFLINE_DB_NAME,
        DB_VERSION,
    );
}

export type RemoveOfflineSnippetInput = { id: string };

export async function removeOfflineSnippet(input: RemoveOfflineSnippetInput): Promise<void> {
    await withStore(
        SNIPPETS_STORE,
        'readwrite',
        async store => {
            store.delete(input.id);
        },
        SNIPPETS_OFFLINE_DB_NAME,
        DB_VERSION,
    );
}

export type UpdateOfflineSnippetInput = Partial<Omit<OfflineSnippetItem, 'id' | 'savedAt'>> & { id: string };

export async function updateOfflineSnippet(patch: UpdateOfflineSnippetInput): Promise<void> {
    await withStore(
        SNIPPETS_STORE,
        'readwrite',
        async store => {
            const current = await new Promise<OfflineSnippetItem | undefined>((resolve, reject) => {
                const req = store.get(patch.id);
                req.onsuccess = () => resolve(req.result as OfflineSnippetItem | undefined);
                req.onerror = () => reject(req.error);
            });
            if (!current) return;
            const updated: OfflineSnippetItem = {
                ...current,
                // Map allowed fields if provided in patch
                name: patch.name ?? current.name,
                slug: patch.slug ?? current.slug,
                code: patch.code ?? current.code,
                language: patch.language ?? current.language,
                description: patch.description ?? current.description,
                note: patch.note ?? current.note,
                creator: patch.creator ?? current.creator,
                tags: patch.tags ?? current.tags,
                // Preserve identifiers and timestamps
                id: current.id,
                savedAt: current.savedAt ?? new Date(),
            };
            store.put(updated);
        },
        SNIPPETS_OFFLINE_DB_NAME,
        DB_VERSION,
    );
}

export type GetOfflineSnippetInput = { id: string };

export async function getOfflineSnippet(
    input: GetOfflineSnippetInput,
): Promise<OfflineSnippetItem | undefined> {
    return await withStore(
        SNIPPETS_STORE,
        'readonly',
        async store => {
            return await new Promise<OfflineSnippetItem | undefined>((resolve, reject) => {
                const req = store.get(input.id);
                req.onsuccess = () => resolve(req.result as OfflineSnippetItem | undefined);
                req.onerror = () => reject(req.error);
            });
        },
        SNIPPETS_OFFLINE_DB_NAME,
        DB_VERSION,
    );
}

export async function listOfflineSnippets(): Promise<OfflineSnippetItem[]> {
    return await withStore(
        SNIPPETS_STORE,
        'readonly',
        async store => {
            return await new Promise<OfflineSnippetItem[]>((resolve, reject) => {
                const req = store.getAll();
                req.onsuccess = () => resolve((req.result as OfflineSnippetItem[]) ?? []);
                req.onerror = () => reject(req.error);
            });
        },
        SNIPPETS_OFFLINE_DB_NAME,
        DB_VERSION,
    );
}
