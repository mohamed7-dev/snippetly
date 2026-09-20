import { UpdateDeveloperAccountDtoType } from '@snippetly/common/dto';
import { RequestContext } from '../../../api/request-context/request-context';
import { Developer } from '../../../entities/developer/developer.entity';
import { AppEntityEvent, AppEntityEventType } from '../app-entity-event';

type Input = UpdateDeveloperAccountDtoType['input'] | { id: string };

export class DeveloperEvent extends AppEntityEvent<Developer> {
    constructor(
        public ctx: RequestContext,
        developer: Developer,
        eventType: AppEntityEventType,
        input?: Input,
    ) {
        super(ctx, developer, eventType, input);
    }
}
