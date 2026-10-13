import type { ApiSuccess } from '@/lib/api-client';
import type { SnippetListDtoType } from '@snippetly/common/dto';
import { APP_NAME } from '@snippetly/common/lib';
import Dexie, { type Table } from 'dexie';

export const SNIPPETS_OFFLINE_DB_NAME = `${APP_NAME.toLowerCase()}-offline`;

const DEFAULT_SAVED_BY = 'anonymous';

type SnippetListItem = ApiSuccess<SnippetListDtoType['output']>['items'][number];

export interface OfflineSnippetItem extends Pick<
    SnippetListItem,
    'name' | 'code' | 'language' | 'creator' | 'id' | 'description' | 'note' | 'tags' | 'slug'
> {
    collection?: {
        id?: string;
        name?: string;
        slug?: string;
        color?: string;
    } | null;
    savedAt: Date;
    savedBy?: string;
}

export type InsertOfflineSnippetInput = Omit<OfflineSnippetItem, 'savedAt'>;
export type RemoveOfflineSnippetInput = { id: string };
export type UpdateOfflineSnippetInput = Partial<Omit<OfflineSnippetItem, 'id' | 'savedAt' | 'savedBy'>> & {
    id: string;
};
export type GetOfflineSnippetInput = { id: string; savedBy?: string };

class OfflineSnippetsDatabase extends Dexie {
    snippets!: Table<OfflineSnippetItem, string>;

    constructor() {
        super(SNIPPETS_OFFLINE_DB_NAME);

        this.version(1).stores({
            snippets: '&id,savedBy,language,collectionId,createdAt',
        });
        this.version(2).stores({
            snippets: '&id,savedBy,language,collectionId,createdAt,collection.name',
        });
    }
}

export const offlineSnippetsDb = new OfflineSnippetsDatabase();

export async function insertOfflineSnippet(snippet: InsertOfflineSnippetInput): Promise<void> {
    await offlineSnippetsDb.transaction('rw', offlineSnippetsDb.snippets, async () => {
        const current = await offlineSnippetsDb.snippets.get(snippet.id);
        if (current) return;

        await offlineSnippetsDb.snippets.add({
            ...snippet,
            savedAt: new Date(),
            savedBy: snippet.savedBy ?? DEFAULT_SAVED_BY,
        });
    });
}

export async function removeOfflineSnippet(input: RemoveOfflineSnippetInput): Promise<void> {
    await offlineSnippetsDb.snippets.delete(input.id);
}

export async function updateOfflineSnippet(patch: UpdateOfflineSnippetInput): Promise<void> {
    await offlineSnippetsDb.transaction('rw', offlineSnippetsDb.snippets, async () => {
        const current = await offlineSnippetsDb.snippets.get(patch.id);
        if (!current) return;

        await offlineSnippetsDb.snippets.put({
            ...current,
            ...patch,
            id: current.id,
            savedAt: current.savedAt,
            savedBy: current.savedBy ?? DEFAULT_SAVED_BY,
        });
    });
}

export async function getOfflineSnippet(
    input: GetOfflineSnippetInput,
): Promise<OfflineSnippetItem | undefined> {
    const snippet = await offlineSnippetsDb.snippets.get(input.id);
    const savedBy = input.savedBy ?? DEFAULT_SAVED_BY;
    return snippet?.savedBy === savedBy ? snippet : undefined;
}

export async function listOfflineSnippets(activeUserId?: string): Promise<OfflineSnippetItem[]> {
    return offlineSnippetsDb.snippets
        .where('savedBy')
        .equals(activeUserId ?? DEFAULT_SAVED_BY)
        .toArray();
}
