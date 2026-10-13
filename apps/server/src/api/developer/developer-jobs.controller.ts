import { Request, Response, Router } from 'express';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { JobRunner } from '../../services/domain/job-runner.service';
import { AppJob, JobQueue } from '../../services/helpers/job-qeueue.service';

type RequestWithRawBody = Request & { rawBody?: string };

function isAppJob(value: unknown): value is AppJob {
    if (typeof value !== 'object' || value === null || !('type' in value)) return false;

    if (value.type === 'delete-developer-account') {
        return (
            'userId' in value &&
            typeof value.userId === 'string' &&
            value.userId.length > 0 &&
            'deleteAfter' in value &&
            typeof value.deleteAfter === 'number' &&
            Number.isFinite(value.deleteAfter)
        );
    }

    return (
        value.type === 'copy-collection-snippets' &&
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
}

@Controller({ path: 'jobs', version: 1 })
export class DeveloperJobsController implements AppRouter {
    constructor(
        private readonly jobQueue: JobQueue,
        private readonly jobRunner: JobRunner,
    ) {}

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

            await this.jobRunner.run(req.body);
            res.sendStatus(204);
        });

        return router;
    }
}
