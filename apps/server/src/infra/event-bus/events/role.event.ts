import { RequestContext } from '../../../api/request-context/request-context';
import { Role } from '../../../entities/role/role.entity';
import { AppEntityEvent, AppEntityEventType } from '../app-entity-event';

type Input = any;

type EventType = AppEntityEventType;

export class RoleEvent extends AppEntityEvent<Role> {
    constructor(
        public ctx: RequestContext,
        role: Role,
        eventType: EventType,
        input?: Input,
    ) {
        super(ctx, role, eventType, input);
    }
}
