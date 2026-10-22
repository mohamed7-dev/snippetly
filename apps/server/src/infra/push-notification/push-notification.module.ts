import { ConfigModule } from '../../config/config.module';
import { DatabaseModule } from '../database/database.module';
import { EventBusModule } from '../event-bus/even-bus.module';
import { Module } from '../ioc-container/module.decorator';
import { PushNotificationService } from './push-notification.service';

@Module({
    providers: [PushNotificationService],
    exports: [PushNotificationService],
    imports: [DatabaseModule, ConfigModule, EventBusModule],
})
export class PushNotificationModule {}
