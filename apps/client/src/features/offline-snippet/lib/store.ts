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
export type RemoveOfflineSnippetInput = { id: string; savedBy?: string };
export type UpdateOfflineSnippetInput = Partial<Omit<OfflineSnippetItem, 'id' | 'savedAt' | 'savedBy'>> & {
    id: string;
    savedBy?: string;
};
export type GetOfflineSnippetInput = { id: string; savedBy?: string };

class OfflineSnippetsDatabase extends Dexie {
    snippets!: Table<OfflineSnippetItem, string>;
    userSnippets!: Table<OfflineSnippetItem, [string, string]>;

    constructor() {
        super(SNIPPETS_OFFLINE_DB_NAME);

        this.version(1).stores({
            snippets: '&id,savedBy,language,collectionId,createdAt',
        });
        this.version(2).stores({
            snippets: '&id,savedBy,language,collectionId,createdAt,collection.name',
        });
        this.version(3)
            .stores({
                snippets: '&id,savedBy,language,collectionId,createdAt,collection.name',
                userSnippets: '&[id+savedBy],id,savedBy,language,collectionId,createdAt,collection.name',
            })
            .upgrade(async transaction => {
                const existingSnippets = await transaction.table('snippets').toArray();
                await transaction.table('userSnippets').bulkPut(
                    existingSnippets.map(snippet => ({
                        ...snippet,
                        savedBy: snippet.savedBy ?? DEFAULT_SAVED_BY,
                    })),
                );
            });
    }
}

export const offlineSnippetsDb = new OfflineSnippetsDatabase();

export async function insertOfflineSnippet(snippet: InsertOfflineSnippetInput): Promise<void> {
    const savedBy = snippet.savedBy ?? DEFAULT_SAVED_BY;
    await offlineSnippetsDb.transaction('rw', offlineSnippetsDb.userSnippets, async () => {
        const current = await offlineSnippetsDb.userSnippets.get([snippet.id, savedBy]);
        if (current) return;

        await offlineSnippetsDb.userSnippets.add({
            ...snippet,
            savedAt: new Date(),
            savedBy,
        });
    });
}

export async function removeOfflineSnippet(input: RemoveOfflineSnippetInput): Promise<void> {
    await offlineSnippetsDb.userSnippets.delete([input.id, input.savedBy ?? DEFAULT_SAVED_BY]);
}

export async function updateOfflineSnippet(patch: UpdateOfflineSnippetInput): Promise<void> {
    const savedBy = patch.savedBy ?? DEFAULT_SAVED_BY;
    await offlineSnippetsDb.transaction('rw', offlineSnippetsDb.userSnippets, async () => {
        const current = await offlineSnippetsDb.userSnippets.get([patch.id, savedBy]);
        if (!current) return;

        await offlineSnippetsDb.userSnippets.put({
            ...current,
            ...patch,
            id: current.id,
            savedBy: current.savedBy ?? DEFAULT_SAVED_BY,
            savedAt: current.savedAt,
        });
    });
}

export async function getOfflineSnippet(
    input: GetOfflineSnippetInput,
): Promise<OfflineSnippetItem | undefined> {
    const savedBy = input.savedBy ?? DEFAULT_SAVED_BY;
    return offlineSnippetsDb.userSnippets.get([input.id, savedBy]);
}

export async function listOfflineSnippets(activeUserId?: string): Promise<OfflineSnippetItem[]> {
    return offlineSnippetsDb.userSnippets
        .where('savedBy')
        .equals(activeUserId ?? DEFAULT_SAVED_BY)
        .toArray();
}
