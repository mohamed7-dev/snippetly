import { Module } from '../infra/ioc-container/module.decorator';
import { ConfigService } from './config.service';

@Module({
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
