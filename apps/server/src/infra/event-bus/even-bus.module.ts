import { Module } from '../ioc-container/module.decorator';
import { EventBus } from './event-bus.service';

@Module({
    providers: [EventBus],
    exports: [EventBus],
})
export class EventBusModule {}
