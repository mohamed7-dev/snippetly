import { ConfigModule } from '../../config/config.module';
import { Module } from '../ioc-container/module.decorator';
import { CacheService } from './cache.service';

@Module({
    imports: [ConfigModule],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule {}
