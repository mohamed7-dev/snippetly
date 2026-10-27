import { RequestContext } from '../../../api/request-context/request-context';
import { AppEvent } from '../app-event';

export class LogoutEvent extends AppEvent {
    constructor(public ctx: RequestContext) {
        super();
    }
}
