import { CreateSnippetDtoType, ForkSnippetDtoType, UpdateSnippetDtoType } from '@snippetly/common/dto';
import { RequestContext } from '../../../api/request-context/request-context';
import { Snippet } from '../../../entities/snippets/snippet.entity';
import { AppEntityEvent, AppEntityEventType } from '../app-entity-event';

type Input =
    | CreateSnippetDtoType['input']
    | UpdateSnippetDtoType['input']
    | ForkSnippetDtoType['input']
    | { id: string };

type EventType = AppEntityEventType | 'forked';

export class SnippetEvent extends AppEntityEvent<Snippet> {
    constructor(
        public ctx: RequestContext,
        snippet: Snippet,
        eventType: EventType,
        input?: Input,
    ) {
        super(ctx, snippet, eventType, input);
    }
}
