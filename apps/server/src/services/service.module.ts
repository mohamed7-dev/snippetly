import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../infra/database/database.module';
import { EventBusModule } from '../infra/event-bus/even-bus.module';
import { Module } from '../infra/ioc-container/module.decorator';
import { AdministratorService } from './domain/administrator.service';
import { AuthService } from './domain/auth.service';
import { CollectionService } from './domain/collection.service';
import { DeveloperService } from './domain/developer.service';
import { FriendshipService } from './domain/friendship.service';
import { RoleService } from './domain/role.service';
import { SessionService } from './domain/session.service';
import { SnippetService } from './domain/snippet.service';
import { TagService } from './domain/tag.service';
import { UserService } from './domain/user.service';
import { EmailClient } from './helpers/email-client.service';
import { InitializerService } from './helpers/initializer.service';
import { ListQueryBuilder } from './helpers/list-query-builder/list-query-builder.service';
import { PasswordHashingService } from './helpers/password-hashing.service';
import { PasswordValidationService } from './helpers/password-validation.service';
import { RequestContextService } from './helpers/request-context.service';
import { SlugValidator } from './helpers/slug-validator.service';
import { VerificationTokenGenerator } from './helpers/verification-token-generator.service';

const helpers = [
    RequestContextService,
    PasswordHashingService,
    VerificationTokenGenerator,
    PasswordValidationService,
    SlugValidator,
    ListQueryBuilder,
    EmailClient,
];

const services = [
    UserService,
    RoleService,
    AuthService,
    SessionService,
    AdministratorService,
    DeveloperService,
    SnippetService,
    CollectionService,
    TagService,
    FriendshipService,
];

@Module({
    imports: [ConfigModule, DatabaseModule, EventBusModule],
    providers: [...helpers, ...services, InitializerService],
    exports: [...helpers, ...services],
})
export class ServiceModule {}
