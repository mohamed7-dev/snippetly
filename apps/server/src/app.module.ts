import { ApiModule } from './api/api.module';
import { ConfigModule } from './config/config.module';
import { CacheModule } from './infra/cache/cache.module';
import { DatabaseModule } from './infra/database/database.module';
import { EventBusModule } from './infra/event-bus/even-bus.module';
import { I18nModule } from './infra/i18n/i18n.module';
import { Module } from './infra/ioc-container/module.decorator';

@Module({
    imports: [DatabaseModule, ConfigModule, I18nModule, ApiModule, CacheModule, EventBusModule],
})
export class AppModule {}
