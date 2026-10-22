import { ConfigModule } from '../../config/config.module';
import { EventBusModule } from '../event-bus/even-bus.module';
import { Module } from '../ioc-container/module.decorator';
import { JobQueue } from './job-qeueue.service';

@Module({
    providers: [JobQueue],
    exports: [JobQueue],
    imports: [ConfigModule, EventBusModule],
})
export class JobQueueModule {}
