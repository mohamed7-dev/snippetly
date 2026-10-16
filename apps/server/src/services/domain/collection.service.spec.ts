import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../entities/collections/collection.entity', () => ({ Collection: class Collection {} }));
vi.mock('../../entities/snippets/snippet.entity', () => ({ Snippet: class Snippet {} }));

import { DatabaseService } from '../../infra/database/database.service';
import { CollectionService } from './collection.service';

describe('CollectionService', () => {
    it('returns empty snippet previews without querying when there are no collections', async () => {
        const databaseService = {
            getRepository: vi.fn(),
        };
        const service = new CollectionService(
            databaseService as unknown as DatabaseService,
            {} as never,
            {} as never,
            {} as never,
            {} as never,
            {} as never,
            {} as never,
            {} as any,
        );

        const previews = await service.addSnippetsPreview({} as never, [], {
            includePrivateSnippets: true,
        });

        expect(databaseService.getRepository).not.toHaveBeenCalled();
        expect(previews.snippetCountByCollection).toEqual(new Map());
        expect(previews.snippetsByCollection).toEqual(new Map());
    });
});
