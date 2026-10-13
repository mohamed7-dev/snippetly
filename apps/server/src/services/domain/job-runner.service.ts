import { IsNull } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { Collection } from '../../entities/collections/collection.entity';
import { Developer } from '../../entities/developer/developer.entity';
import { Snippet } from '../../entities/snippets/snippet.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { AppJob, JobQueue } from '../helpers/job-qeueue.service';
import { SnippetService } from './snippet.service';

const MAX_JOB_DELAY_SECONDS = 7 * 24 * 60 * 60 - 60;

@Injectable()
export class JobRunner {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly snippetService: SnippetService,
        private readonly jobQueue: JobQueue,
    ) {}

    public async run(job: any): Promise<void> {
        if (job.type === 'delete-developer-account') {
            await this.deleteDeveloperAccount(job);
            return;
        }

        await this.copyCollectionSnippets(job);
    }

    public async deleteDeveloperAccount(job: Extract<AppJob, { type: 'delete-developer-account' }>) {
        const userRepo = this.databaseService.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: job.userId },
            withDeleted: true,
        });
        if (!user?.deletedAt) return;

        const developerRepo = this.databaseService.getRepository(Developer);
        const developer = await developerRepo.findOne({
            where: { user: { id: job.userId } },
            withDeleted: true,
        });
        if (!developer?.deletedAt || developer.scheduledDeletionAt?.getTime() !== job.deleteAfter) return;

        const remainingSeconds = Math.ceil((job.deleteAfter - Date.now()) / 1000);
        if (remainingSeconds > 0) {
            await this.jobQueue.enqueue(job, Math.min(remainingSeconds, MAX_JOB_DELAY_SECONDS));
            return;
        }

        await userRepo.delete(job.userId);
    }

    public async copyCollectionSnippets(job: Extract<AppJob, { type: 'copy-collection-snippets' }>) {
        const developer = await this.databaseService.getRepository(Developer).findOne({
            where: { id: job.developerId },
            relations: { user: true },
        });
        if (!developer) return;

        const collectionRepo = this.databaseService.getRepository(Collection);
        const [sourceCollection, targetCollection] = await Promise.all([
            collectionRepo.findOne({ where: { id: job.sourceCollectionId } }),
            collectionRepo.findOne({
                where: { id: job.targetCollectionId, creator: { id: job.developerId } },
            }),
        ]);
        if (!sourceCollection || !targetCollection) return;

        const snippetRepo = this.databaseService.getRepository(Snippet);
        const sources = await snippetRepo.find({
            where: {
                collection: { id: sourceCollection.id },
                deletedAt: IsNull(),
                isPrivate: false,
                allowForking: true,
            },
            order: { createdAt: 'ASC' },
        });

        const now = Date.now();
        const context = new RequestContext({
            apiType: 'developer',
            isAuthorized: true,
            isAuthorizedAsOwnerOnly: false,
            session: {
                token: 'collection-copy-job',
                id: 'collection-copy-job',
                user: {
                    id: developer.user.id,
                    identifier: developer.user.identifier,
                    isVerified: developer.user.isVerified,
                    permissions: [],
                },
                sessionExpiry: new Date(now + MAX_JOB_DELAY_SECONDS * 1000),
                cacheExpiry: now + MAX_JOB_DELAY_SECONDS * 1000,
            },
        });

        for (const source of sources) {
            const alreadyCopied = await snippetRepo.findOne({
                where: {
                    forkedFrom: { id: source.id },
                    collection: { id: targetCollection.id },
                    creator: { id: developer.id },
                    deletedAt: IsNull(),
                },
                select: { id: true },
            });
            if (alreadyCopied) continue;

            await this.snippetService.fork(context, {
                id: source.id,
                collectionId: targetCollection.id,
            });
        }
    }
}
