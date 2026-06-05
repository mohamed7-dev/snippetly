import { Module } from '../infra/ioc-container/module.decorator';
import { ServiceModule } from '../services/service.module';
import { DeveloperAuthController } from './developer/developer-auth.controller';

@Module({
    imports: [ServiceModule],
    exports: [ServiceModule],
})
class CommonApiModule {}

@Module({
    imports: [CommonApiModule],
    controllers: [],
})
class AdminApiModule {}

@Module({
    imports: [CommonApiModule],
    controllers: [DeveloperAuthController],
})
class DeveloperApiModule {}

@Module({
    imports: [AdminApiModule, DeveloperApiModule],
})
export class ApiModule {}
