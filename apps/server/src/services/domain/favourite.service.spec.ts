import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../entities/collections/collection.entity', () => ({ Collection: class Collection {} }));
vi.mock('../../entities/developer/developer.entity', () => ({ Developer: class Developer {} }));
vi.mock('../../entities/favourites/favourite.entity', () => ({ Favourite: class Favourite {} }));
vi.mock('../../entities/snippets/snippet.entity', () => ({ Snippet: class Snippet {} }));

import { DatabaseService } from '../../infra/database/database.service';
import { FavouriteService } from './favourite.service';

describe('FavouriteService', () => {
    it('returns an empty status map without querying when there are no resource IDs', async () => {
        const databaseService = {
            getRepository: vi.fn(),
        };
        const service = new FavouriteService(databaseService as unknown as DatabaseService, {} as never);

        const statusById = await service.getFavouriteStatusMapForDeveloper({} as never, [], 'collections', {
            id: 'developer-id',
        } as never);

        expect(statusById).toEqual(new Map());
        expect(databaseService.getRepository).not.toHaveBeenCalled();
    });
});
