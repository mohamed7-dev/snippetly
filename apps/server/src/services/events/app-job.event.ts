import { AppEvent } from '../../infra/event-bus/app-event';
import type { AppJob } from '../jobs/app-job';

export class AppJobEvent extends AppEvent {
    constructor(public readonly job: AppJob) {
        super();
    }
}
