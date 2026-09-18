import { notNullOrUndefined } from '@snippetly/common/lib';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { ClassType } from '../../common/types/utils';
import { Injectable } from '../ioc-container/injectable.decorator';
import { Logger } from '../logger/logger';
import { AppEvent } from './app-event';
import { BlockingHandlerOptions } from './types/blocking-event-handler';

const ContextName = 'EventBus';

@Injectable()
export class EventBus {
    private readonly stream = new Subject<AppEvent>();
    private destroy$ = new Subject<void>();

    private readonly handlers = new Map<ClassType<AppEvent>, Array<BlockingHandlerOptions<any>>>();

    /** @internal */
    onModuleDestroy(): any {
        this.destroy$.next();
    }

    /**
     * @description
     * Returns a stream of events of the given event type
     */
    public ofType<Event extends AppEvent>(event: ClassType<Event>): Observable<Event> {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return this.stream.asObservable().pipe(
            takeUntil(this.destroy$),
            filter(e => e.constructor === event),
            // TODO: we should await any active transaction
            filter(notNullOrUndefined),
        ) as Observable<Event>;
    }

    public async publish<Event extends AppEvent>(event: Event): Promise<void> {
        this.stream.next(event);

        const eventHandlers = this.handlers.get(event.constructor as ClassType<AppEvent>) ?? [];

        for (const handlerOptions of eventHandlers) {
            const start = Date.now();
            await handlerOptions.handler(event);
            const duration = Date.now() - start;
            Logger.debug(`Event handler "${handlerOptions.id}" completed in ${duration}ms`, ContextName);
            if (duration > 100) {
                Logger.warn(
                    [
                        `Event handler "${handlerOptions.id}" is slow (${duration}ms).`,
                        'Consider moving heavy work to a background job.',
                    ].join('\n'),
                    ContextName,
                );
            }
        }
    }

    /**
     * @description
     * Registers blocking event handler
     */
    public register<Event extends AppEvent>(options: BlockingHandlerOptions<Event>): void {
        const events = Array.isArray(options.event) ? options.event : [options.event];

        for (const event of events) {
            let handlerOptions = this.handlers.get(event);
            if (handlerOptions?.some(handlerOptions => handlerOptions.id === options.id)) {
                throw new Error(`Duplicate event handler "${options.id}" for ${event.name}`);
            }
            if (handlerOptions) {
                handlerOptions.push(options);
            } else {
                handlerOptions = [options];
            }
            this.handlers.set(event, this.orderHandlers(handlerOptions));
        }
    }

    private orderHandlers<Event extends AppEvent>(
        handlersOptions: Array<BlockingHandlerOptions<Event>>,
    ): Array<BlockingHandlerOptions<Event>> {
        const ordered: Array<BlockingHandlerOptions<Event>> = [];

        const lookup = new Map<string, BlockingHandlerOptions<Event>>();

        for (const item of handlersOptions) {
            lookup.set(item.id, item);
        }

        const process = (handlerOptions: BlockingHandlerOptions<Event>): void => {
            if (handlerOptions.after) {
                const dependency = lookup.get(handlerOptions.after);
                if (dependency) {
                    if (dependency.after === handlerOptions.id) {
                        throw new Error(
                            `Circular dependency between "${handlerOptions.id}" and "${dependency.id}"`,
                        );
                    }
                    process(dependency);
                }
            }

            ordered.push(handlerOptions);

            if (handlerOptions.before) {
                const dependency = lookup.get(handlerOptions.before);
                if (dependency) {
                    if (dependency.before === handlerOptions.id) {
                        throw new Error(
                            `Circular dependency between "${handlerOptions.id}" and "${dependency.id}"`,
                        );
                    }

                    // a previous handler could have placed this dependency after it
                    // the current handler asks this dependency to be executed after it
                    // so we have to reposition the dependency in the ordered array to be after
                    // current handler being processed

                    ordered.splice(
                        ordered.findIndex(x => x.id === dependency.id),
                        1,
                    );

                    process(dependency);
                }
            }
        };

        for (const handlerOptions of handlersOptions) {
            process(handlerOptions);
        }

        return ordered;
    }
}
