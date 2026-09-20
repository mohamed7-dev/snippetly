import { RequestContext } from '../../../api/request-context/request-context';
import { Friendship } from '../../../entities/friendships/friendship.entity';
import { AppEntityEvent } from '../app-entity-event';

type EventType = 'sent' | 'accepted' | 'cancelled' | 'rejected';

type Input = {
    requesterId: string;
    addresseeId: string;
    actorId?: string;
};

export class FriendshipEvent extends AppEntityEvent<Friendship> {
    constructor(
        public ctx: RequestContext,
        friendship: Friendship,
        eventType: EventType,
        input?: Input,
    ) {
        super(ctx, friendship, eventType, input);
    }
}
