import { RequestContext } from '../../../api/request-context/request-context';
import { AppEvent } from '../app-event';

export class LoginAttemptEvent extends AppEvent {
    constructor(
        public ctx: RequestContext,
        public strategyName: string,
        public identifier?: string,
    ) {
        super();
    }
}
