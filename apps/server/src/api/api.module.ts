import { Module } from '../infra/ioc-container/module.decorator';
import { ServiceModule } from '../services/service.module';
import { DeveloperAuthController } from './developer/developer-auth.controller';
import { DeveloperCollectionController } from './developer/developer-collection.controller';
import { DeveloperSnippetController } from './developer/developer-snippet.controller';

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
    controllers: [DeveloperAuthController, DeveloperSnippetController, DeveloperCollectionController],
})
class DeveloperApiModule {}

@Module({
    imports: [AdminApiModule, DeveloperApiModule],
})
export class ApiModule {}
