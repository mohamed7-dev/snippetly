import { Module } from '../infra/ioc-container/module.decorator';
import { ServiceModule } from '../services/service.module';
import { DeveloperAuthController } from './developer/developer-auth.controller';
import { DeveloperCollectionController } from './developer/developer-collection.controller';
import { DeveloperFriendshipController } from './developer/developer-friendship.controller';
import { DeveloperSnippetController } from './developer/developer-snippet.controller';
import { DeveloperTagController } from './developer/developer-tag.controller';

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
    controllers: [
        DeveloperAuthController,
        DeveloperSnippetController,
        DeveloperCollectionController,
        DeveloperFriendshipController,
        DeveloperTagController,
    ],
})
class DeveloperApiModule {}

@Module({
    imports: [AdminApiModule, DeveloperApiModule],
})
export class ApiModule {}
