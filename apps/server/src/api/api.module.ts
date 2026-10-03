import { DEFAULT_ADMIN_API_PATH_PREFIX, DEFAULT_DEVELOPER_API_PATH_PREFIX } from '@snippetly/common/lib';
import { ConfigModule } from '../config/config.module';
import { Module } from '../infra/ioc-container/module.decorator';
import { ServiceModule } from '../services/service.module';
import { AdminAuthController } from './admin/admin-auth.controller';
import { AdminDeveloperController } from './admin/admin-developer.controller';
import { DeveloperAuthController } from './developer/developer-auth.controller';
import { DeveloperCollectionController } from './developer/developer-collection.controller';
import { DeveloperDeveloperController } from './developer/developer-developer.controller';
import { DeveloperFriendshipController } from './developer/developer-friendship.controller';
import { DeveloperSlugController } from './developer/developer-slug.controller';
import { DeveloperSnippetController } from './developer/developer-snippet.controller';
import { DeveloperTagController } from './developer/developer-tag.controller';

@Module({
    imports: [ServiceModule, ConfigModule],
    exports: [ServiceModule, ConfigModule],
})
class CommonApiModule {}

@Module({
    imports: [CommonApiModule],
    controllers: [AdminDeveloperController, AdminAuthController],
    prefix: DEFAULT_ADMIN_API_PATH_PREFIX,
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
        DeveloperDeveloperController,
        DeveloperSlugController,
    ],
    prefix: DEFAULT_DEVELOPER_API_PATH_PREFIX,
})
class DeveloperApiModule {}

@Module({
    imports: [AdminApiModule, DeveloperApiModule],
})
export class ApiModule {}
