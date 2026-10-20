import { Request, Response, Router } from 'express';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { JobQueue } from '../../services/helpers/job-qeueue.service';
import type { AppJob } from '../../services/jobs/app-job';

type RequestWithRawBody = Request & { rawBody?: string };

function isAppJob(value: unknown): value is AppJob {
    if (typeof value !== 'object' || value === null || !('type' in value)) return false;

    switch (value.type) {
        case 'delete-developer-account':
            return (
                'userId' in value &&
                typeof value.userId === 'string' &&
                value.userId.length > 0 &&
                'deleteAfter' in value &&
                typeof value.deleteAfter === 'number' &&
                Number.isFinite(value.deleteAfter)
            );
        case 'copy-collection-snippets':
            return (
                'sourceCollectionId' in value &&
                typeof value.sourceCollectionId === 'string' &&
                value.sourceCollectionId.length > 0 &&
                'targetCollectionId' in value &&
                typeof value.targetCollectionId === 'string' &&
                value.targetCollectionId.length > 0 &&
                'developerId' in value &&
                typeof value.developerId === 'string' &&
                value.developerId.length > 0
            );
        case 'notify-friends-of-published-snippet':
            return (
                'authorId' in value &&
                typeof value.authorId === 'string' &&
                value.authorId.length > 0 &&
                'snippetId' in value &&
                typeof value.snippetId === 'string' &&
                value.snippetId.length > 0
            );
        case 'notify-friendship-change':
            return (
                'eventType' in value &&
                (value.eventType === 'sent' ||
                    value.eventType === 'accepted' ||
                    value.eventType === 'cancelled' ||
                    value.eventType === 'rejected') &&
                'requesterId' in value &&
                typeof value.requesterId === 'string' &&
                value.requesterId.length > 0 &&
                'addresseeId' in value &&
                typeof value.addresseeId === 'string' &&
                value.addresseeId.length > 0 &&
                'actorId' in value &&
                typeof value.actorId === 'string' &&
                value.actorId.length > 0
            );
        case 'send-account-welcome-email':
        case 'send-account-goodbye-email':
            return 'userId' in value && typeof value.userId === 'string' && value.userId.length > 0;
        default:
            return false;
    }
}

@Controller({ path: 'jobs', version: 1 })
export class DeveloperJobsController implements AppRouter {
    constructor(private readonly jobQueue: JobQueue) {}

    initRoutes(router: Router): Router {
        router.post('/', async (req: RequestWithRawBody, res: Response) => {
            const rawBody = req.rawBody;
            const signature = req.get('upstash-signature');
            if (rawBody === undefined || !signature) {
                res.sendStatus(400);
                return;
            }

            const isValid = await this.jobQueue.verifyWebhook(signature, rawBody);
            if (!isValid) {
                res.sendStatus(401);
                return;
            }

            if (!isAppJob(req.body)) {
                res.sendStatus(400);
                return;
            }

            await this.jobQueue.run(req.body);
            res.sendStatus(204);
        });

        return router;
    }
}
