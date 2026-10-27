import { RequestContext } from '../../../api/request-context/request-context';
import { Developer } from '../../../entities/developer/developer.entity';
import { AppEvent } from '../app-event';

export class AccountVerifiedEvent extends AppEvent {
    constructor(
        public ctx: RequestContext,
        public developer: Developer,
    ) {
        super();
    }
}
