import { AppJob } from '../../job-queue/types';
import { AppEvent } from '../app-event';

export class AppJobEvent extends AppEvent {
    constructor(public readonly job: AppJob) {
        super();
    }
}
