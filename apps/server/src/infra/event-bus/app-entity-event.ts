import { RequestContext } from '../../api/request-context/request-context';
import { AppEvent } from './app-event';

export type AppEntityEventType = 'created' | 'updated' | 'deleted';

/**
 * @description
 * Abstract class extended by all entity events used by the EventBus system.
 */
export abstract class AppEntityEvent<Entity, Input = any> extends AppEvent {
    protected constructor(
        public ctx: RequestContext,
        public entity: Entity,
        public type: AppEntityEventType,
        public input?: Input,
    ) {
        super();
    }
}
