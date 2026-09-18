import { ClassType } from '../../../common/types/utils';
import { AppEvent } from '../app-event';

export interface BlockingHandlerOptions<Event extends AppEvent> {
    event: ClassType<Event> | Array<ClassType<Event>>;
    /**
     * Unique identifier used for ordering
     */
    id: string;
    handler: (event: Event) => void | Promise<void>;
    /**
     * Identifier of a handler that this handler should run before
     */
    before?: string;
    /**
     * Identifier of a handler that this handler should run after
     */
    after?: string;
}
