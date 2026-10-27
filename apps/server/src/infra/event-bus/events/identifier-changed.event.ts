import { RequestContext } from '../../../api/request-context/request-context';
import { User } from '../../../entities/users/user.entity';
import { AppEvent } from '../app-event';

export class IdentifierChangedEvent extends AppEvent {
    constructor(
        public ctx: RequestContext,
        public user: User,
        public oldIdentifier: string,
    ) {
        super();
    }
}
