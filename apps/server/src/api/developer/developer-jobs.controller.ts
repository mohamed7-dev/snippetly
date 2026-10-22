import { Request, Response, Router } from 'express';
import { AppRouter } from '../../common/types/app-router.interface';
import { Controller } from '../../infra/ioc-container/controller.decorator';
import { JobQueue } from '../../infra/job-queue/job-qeueue.service';

type RequestWithRawBody = Request & { rawBody?: string };

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

            if (!this.jobQueue.isAppJob(req.body)) {
                res.sendStatus(400);
                return;
            }

            await this.jobQueue.run(req.body);
            res.sendStatus(204);
        });

        return router;
    }
}
