import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../entities/collections/collection.entity', () => ({ Collection: class Collection {} }));
vi.mock('../../entities/developer/developer.entity', () => ({ Developer: class Developer {} }));
vi.mock('../../entities/snippets/snippet.entity', () => ({ Snippet: class Snippet {} }));
vi.mock('../../entities/users/user.entity', () => ({ User: class User {} }));
vi.mock('./snippet.service', () => ({ SnippetService: class SnippetService {} }));

import { Collection } from '../../entities/collections/collection.entity';
import { Developer } from '../../entities/developer/developer.entity';
import { Snippet } from '../../entities/snippets/snippet.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { SnippetService } from './snippet.service';
import { JobRunner } from './job-runner.service';
import { JobQueue } from '../helpers/job-qeueue.service';

describe('JobRunner', () => {
    let databaseService: Pick<DatabaseService, 'getRepository'>;
    let snippetService: Pick<SnippetService, 'fork'>;
    let jobQueue: Pick<JobQueue, 'enqueue'>;
    let enqueueJob: ReturnType<typeof vi.fn>;
    let runner: JobRunner;

    beforeEach(() => {
        databaseService = {
            getRepository: vi.fn(),
        };
        enqueueJob = vi.fn().mockResolvedValue(undefined);
        jobQueue = { enqueue: enqueueJob };
        snippetService = {
            fork: vi.fn().mockResolvedValue(undefined),
        };
        runner = new JobRunner(databaseService as DatabaseService, snippetService as SnippetService, jobQueue as JobQueue);
    });

    it('rechecks delayed account deletion at most once per QStash delay window', async () => {
        const deleteAfter = Date.now() + 30 * 24 * 60 * 60 * 1000;
        const userRepo = {
            findOne: vi.fn().mockResolvedValue({ deletedAt: new Date() }),
            delete: vi.fn(),
        };
        const developerRepo = {
            findOne: vi.fn().mockResolvedValue({
                deletedAt: new Date(),
                scheduledDeletionAt: new Date(deleteAfter),
            }),
        };
        vi.mocked(databaseService.getRepository).mockImplementation(target =>
            target === User ? userRepo : developerRepo,
        );

        await runner.run({ type: 'delete-developer-account', userId: 'user-id', deleteAfter });

        expect(userRepo.delete.mock.calls).toHaveLength(0);
        const queueCalls = enqueueJob.mock.calls;
        expect(queueCalls[0]).toEqual([
            { type: 'delete-developer-account', userId: 'user-id', deleteAfter },
            expect.any(Number),
        ]);
        const delaySeconds = queueCalls[0][1]!;
        expect(delaySeconds).toBeLessThanOrEqual(7 * 24 * 60 * 60);
    });

    it('does not hard-delete an account that has been restored', async () => {
        const userRepo = {
            findOne: vi.fn().mockResolvedValue({ deletedAt: null }),
            delete: vi.fn(),
        };
        vi.mocked(databaseService.getRepository).mockReturnValue(userRepo as never);

        await runner.run({
            type: 'delete-developer-account',
            userId: 'restored-user',
            deleteAfter: Date.now() - 1,
        });

        expect(userRepo.delete.mock.calls).toHaveLength(0);
        expect(enqueueJob.mock.calls).toHaveLength(0);
    });

    it('hard-deletes a still-deleted account once its scheduled deadline passes', async () => {
        const deleteAfter = Date.now() - 1;
        const userRepo = {
            findOne: vi.fn().mockResolvedValue({ deletedAt: new Date() }),
            delete: vi.fn().mockResolvedValue({ affected: 1 }),
        };
        const developerRepo = {
            findOne: vi.fn().mockResolvedValue({
                deletedAt: new Date(),
                scheduledDeletionAt: new Date(deleteAfter),
            }),
        };
        vi.mocked(databaseService.getRepository).mockImplementation(target =>
            target === User ? userRepo : developerRepo,
        );

        await runner.run({
            type: 'delete-developer-account',
            userId: 'user-id',
            deleteAfter,
        });

        expect(userRepo.delete.mock.calls).toEqual([['user-id']]);
        expect(enqueueJob.mock.calls).toHaveLength(0);
    });

    it('ignores a stale deletion job from an earlier deletion cycle', async () => {
        const userRepo = {
            findOne: vi.fn().mockResolvedValue({ deletedAt: new Date() }),
            delete: vi.fn(),
        };
        const developerRepo = {
            findOne: vi.fn().mockResolvedValue({
                deletedAt: new Date(),
                scheduledDeletionAt: new Date(Date.now() + 10_000),
            }),
        };
        vi.mocked(databaseService.getRepository).mockImplementation(target =>
            target === User ? userRepo : developerRepo,
        );

        await runner.run({
            type: 'delete-developer-account',
            userId: 'user-id',
            deleteAfter: Date.now() - 1,
        });

        expect(userRepo.delete.mock.calls).toHaveLength(0);
        expect(enqueueJob.mock.calls).toHaveLength(0);
    });

    it('copies only eligible source snippets into the forked collection', async () => {
        const sourceCollection = { id: 'source-collection' } as Collection;
        const targetCollection = { id: 'target-collection' } as Collection;
        const developer = {
            id: 'developer-id',
            user: { id: 'user-id', identifier: 'developer@example.com', isVerified: true },
        } as Developer;
        const sourceSnippet = { id: 'snippet-id' } as Snippet;
        const developerRepo = { findOne: vi.fn().mockResolvedValue(developer) };
        const collectionRepo = {
            findOne: vi.fn().mockResolvedValueOnce(sourceCollection).mockResolvedValueOnce(targetCollection),
        };
        const snippetRepo = {
            find: vi.fn().mockResolvedValue([sourceSnippet]),
            findOne: vi.fn().mockResolvedValue(undefined),
        };
        vi.mocked(databaseService.getRepository).mockImplementation(target => {
            if (target === Developer) return developerRepo as never;
            if (target === Collection) return collectionRepo as never;
            return snippetRepo as never;
        });

        await runner.run({
            type: 'copy-collection-snippets',
            sourceCollectionId: sourceCollection.id,
            targetCollectionId: targetCollection.id,
            developerId: developer.id,
        });

        expect(snippetRepo.find).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    isPrivate: false,
                    allowForking: true,
                }),
            }),
        );
        expect(snippetService.fork.mock.calls[0]).toEqual([
            expect.anything(),
            { id: sourceSnippet.id, collectionId: targetCollection.id },
        ]);
    });
});
