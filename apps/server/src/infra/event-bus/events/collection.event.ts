import {
    CreateCollectionDtoType,
    ForkCollectionDtoType,
    UpdateCollectionDtoType,
} from '@snippetly/common/dto';
import { RequestContext } from '../../../api/request-context/request-context';
import { Collection } from '../../../entities/collections/collection.entity';
import { AppEntityEvent, AppEntityEventType } from '../app-entity-event';

type Input =
    | CreateCollectionDtoType['input']
    | UpdateCollectionDtoType['input']
    | ForkCollectionDtoType['input']
    | { id: string };

type EventType = AppEntityEventType | 'forked';

export class CollectionEvent extends AppEntityEvent<Collection> {
    constructor(
        public ctx: RequestContext,
        collection: Collection,
        eventType: EventType,
        input?: Input,
    ) {
        super(ctx, collection, eventType, input);
    }
}
