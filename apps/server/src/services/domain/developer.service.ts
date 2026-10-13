import {
    ChangeEmailAddressDtoType,
    CreateDeveloperDtoType,
    DeleteDeveloperAccountDtoType,
    DeveloperListDtoType,
    FindOneDeveloperDtoType,
    FriendshipStatus,
    RefreshVerificationTokenDtoType,
    RegisterDeveloperAccountDtoType,
    RequestEmailAddressChangeDtoType,
    RequestPasswordResetDtoType,
    ResetPasswordDtoType,
    SuccessResponse,
    UpdateDeveloperAccountDtoType,
    VerifyAccountDtoType,
} from '@snippetly/common/dto';
import { Brackets, FindOptionsRelations, IsNull } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { isApiError } from '../../common/errors/api-error';
import {
    EntityNotFoundError,
    ForbiddenError,
    InternalServerError,
    UserInputError,
} from '../../common/errors/errors';
import {
    EmailAddressConflictError,
    IdentifierChangeTokenExpiredError,
    IdentifierChangeTokenInvalidError,
    MissingPasswordError,
    PasswordResetTokenExpiredError,
    PasswordResetTokenInvalidError,
    PasswordValidationError,
    VerificationTokenExpiredError,
    VerificationTokenInvalidError,
} from '../../common/errors/generated-developer-errors';
import { normalizeInput } from '../../common/helpers/validation';
import { OnApplicationBootstrap } from '../../common/types/lifecycle-hooks';
import { ConfigService } from '../../config';
import { Developer } from '../../entities/developer/developer.entity';
import { Friendship } from '../../entities/friendships/friendship.entity';
import { User } from '../../entities/users/user.entity';
import { Logger } from '../../infra';
import { DatabaseService } from '../../infra/database/database.service';
import { patchEntity } from '../../infra/database/patch-entity';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { AccountRegistrationEvent } from '../../infra/event-bus/events/account-registration.eveny';
import { AccountVerifiedEvent } from '../../infra/event-bus/events/account-verified.event';
import { DeveloperEvent } from '../../infra/event-bus/events/developer.event';
import { IdentifierChangeRequestedEvent } from '../../infra/event-bus/events/identifier-change-requested.event';
import { IdentifierChangedEvent } from '../../infra/event-bus/events/identifier-changed.event';
import { PasswordResetRequestedEvent } from '../../infra/event-bus/events/password-reset-requested.event';
import { PasswordResetVerifiedEvent } from '../../infra/event-bus/events/password-reset-verified.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { moduleRef } from '../../infra/ioc-container/module-ref';
import { EmailClient } from '../helpers/email-client.service';
import { JobQueue } from '../helpers/job-qeueue.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import type { CollectionService } from './collection.service';
import { FriendshipService } from './friendship.service';
import type { SnippetService } from './snippet.service';
import { TagService } from './tag.service';
import { UserService } from './user.service';

@Injectable()
export class DeveloperService implements OnApplicationBootstrap {
    private get snippetService(): SnippetService {
        const { SnippetService } = require('./snippet.service') as typeof import('./snippet.service');
        return moduleRef.getProvider<SnippetService>(SnippetService);
    }

    private get collectionService(): CollectionService {
        const { CollectionService } =
            require('./collection.service') as typeof import('./collection.service');
        return moduleRef.getProvider<CollectionService>(CollectionService);
    }

    constructor(
        private readonly userService: UserService,
        private readonly friendshipService: FriendshipService,
        private readonly tagService: TagService,
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly listQueryBuilder: ListQueryBuilder,
        private readonly eventBus: EventBus,
        private readonly jobQueue: JobQueue,
        private readonly emailClient: EmailClient,
    ) {}

    /**@internal */
    onApplicationBootstrap() {
        this.subscribeToAccountRegistrationEvent();
        this.subscribeToPasswordResetRequestedEvent();
        this.subscribeToIdentifierChangeRequestedEvent();
        this.subscribeToAccountDeletionEvent();
    }

    private subscribeToAccountDeletionEvent() {
        this.eventBus.ofType(DeveloperEvent).subscribe(event => {
            Logger.debug(`Handling event 'DeveloperEvent[#deleted]'`);
            const scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            if (event.type === 'deleted' && event.entity.user) {
                void this.jobQueue.enqueue(
                    {
                        type: 'delete-developer-account',
                        userId: event.entity.user.id,
                        deleteAfter: scheduledDeletionAt.getTime(),
                    },
                    7 * 24 * 60 * 60,
                );
                void this.databaseService.dataSource
                    .getRepository(Developer)
                    .update({ id: event.entity.id }, { scheduledDeletionAt });
            }
        });
    }

    private subscribeToAccountRegistrationEvent() {
        this.eventBus.ofType(AccountRegistrationEvent).subscribe(event => {
            Logger.debug(`Handling event 'AccountRegistrationEvent'`);
            const callbackUrl = `${this.configService.systemOptions.email.accountVerificationCallbackUrl}?token=${event.user.getNativeAuthenticationMethod().verificationToken}`;
            void this.emailClient.sendEmail({
                event,
                to: event.user.identifier,
                subject: 'Account Verification',
                html: `
                    <a font-family="Helvetica"
                        background-color="#f45e43"
                        color="white"
                        href="${callbackUrl}">
                            Verify Me!
                    </a>
                
                `,
            });
        });
    }

    private subscribeToPasswordResetRequestedEvent() {
        this.eventBus.ofType(PasswordResetRequestedEvent).subscribe(event => {
            Logger.debug(`Handling event 'PasswordResetRequestedEvent'`);
            const callbackUrl = `${this.configService.systemOptions.email.passwordResetCallbackUrl}?token=${event.user.getNativeAuthenticationMethod().passwordResetToken}`;
            void this.emailClient.sendEmail({
                event,
                to: event.user.identifier,
                subject: 'Password Reset Request',
                html: `
                    <a font-family="Helvetica"
                        background-color="#f45e43"
                        color="white"
                        href="${callbackUrl}">
                            Reset Password!
                    </a>
                
                `,
            });
        });
    }

    private subscribeToIdentifierChangeRequestedEvent() {
        this.eventBus.ofType(IdentifierChangeRequestedEvent).subscribe(event => {
            Logger.debug(`Handling event 'IdentifierChangeRequestedEvent'`);
            const callbackUrl = `${this.configService.systemOptions.email.identifierChangeCallbackUrl}?token=${event.user.getNativeAuthenticationMethod().identifierChangeToken}`;
            void this.emailClient.sendEmail({
                event,
                to: event.user.identifier,
                subject: 'Email-address Change Request',
                html: `
                    <a font-family="Helvetica"
                        background-color="#f45e43"
                        color="white"
                        href="${callbackUrl}">
                            Change Email-address!
                    </a>
                
                `,
            });
        });
    }

    public async find(
        ctx: RequestContext,
        input: DeveloperListDtoType['input'],
        relations?: FindOptionsRelations<Developer>,
        options?: { includePrivateDevelopers?: boolean; includeSoftDeleted?: boolean },
    ) {
        const qb = this.listQueryBuilder.build(Developer, input as any, {
            ctx,
            relations,
            where: {
                ...(options?.includeSoftDeleted ? {} : { deletedAt: IsNull() }),
                ...(options?.includePrivateDevelopers ? {} : { isPrivate: false }),
            },
        });

        const activeDeveloper = input.discover ? await this.getActiveDeveloper(ctx) : undefined;

        if (activeDeveloper) {
            // exclude active user and his friends from discover
            const friendships = await this.databaseService
                .getRepository(ctx, Friendship)
                .createQueryBuilder('friendship')
                .innerJoin('friendship.requester', 'requester')
                .innerJoin('friendship.addressee', 'addressee')
                .select('requester.id', 'requesterId')
                .addSelect('addressee.id', 'addresseeId')
                .where(
                    new Brackets(qb => {
                        qb.where('requester.id = :activeDeveloperId', {
                            activeDeveloperId: activeDeveloper.id,
                        }).orWhere('addressee.id = :activeDeveloperId', {
                            activeDeveloperId: activeDeveloper.id,
                        });
                    }),
                )
                .andWhere('friendship.status = :acceptedStatus', {
                    acceptedStatus: FriendshipStatus.Accepted,
                })
                .getRawMany<{ requesterId: string; addresseeId: string }>();
            const excludedDeveloperIds = [
                activeDeveloper.id,
                ...friendships.map(({ requesterId, addresseeId }) =>
                    requesterId === activeDeveloper.id ? addresseeId : requesterId,
                ),
            ];

            qb.andWhere(`${qb.alias}.id NOT IN (:...excludedDeveloperIds)`, { excludedDeveloperIds });
        }

        const [items, itemsCount] = await qb.getManyAndCount();

        return { items, itemsCount };
    }

    public async findOne(
        ctx: RequestContext,
        input: FindOneDeveloperDtoType['input'],
        relations?: FindOptionsRelations<Developer>,
        options?: { includePrivateDevelopers?: boolean; includeSoftDeleted?: boolean },
    ): Promise<Developer | undefined> {
        const repo = this.databaseService.getRepository(ctx, Developer);
        const developer = await repo.findOne({
            where: {
                id: input.id,
                ...(options?.includeSoftDeleted ? {} : { deletedAt: IsNull() }),
                ...(options?.includePrivateDevelopers ? {} : { isPrivate: false }),
            },
            relations: {
                ...relations,
            },
        });

        return developer ?? undefined;
    }

    public async getOneByUserId(
        ctx: RequestContext,
        userId: string,
        relations?: FindOptionsRelations<Developer>,
        options?: { includePrivateDevelopers?: boolean; includeSoftDeleted?: boolean },
    ): Promise<Developer | undefined> {
        const repo = this.databaseService.getRepository(ctx, Developer);

        const developer = await repo.findOne({
            where: {
                user: {
                    id: userId,
                },
                ...(options?.includeSoftDeleted ? {} : { deletedAt: IsNull() }),
                ...(options?.includePrivateDevelopers ? {} : { isPrivate: false }),
            },
            relations: {
                ...relations,
            },
        });

        return developer ?? undefined;
    }

    public async getActiveDeveloper(ctx: RequestContext, strict: boolean): Promise<Developer>;
    public async getActiveDeveloper(ctx: RequestContext, strict?: boolean): Promise<Developer | undefined>;
    public async getActiveDeveloper(
        ctx: RequestContext,
        maybeStrict?: boolean,
    ): Promise<Developer | undefined> {
        if (!ctx.activeUserId && maybeStrict) {
            throw new ForbiddenError();
        } else if (!ctx.activeUserId) {
            return undefined;
        }

        const developer = await this.getOneByUserId(ctx, ctx.activeUserId, undefined, {
            includeSoftDeleted: false,
            includePrivateDevelopers: true,
        });

        if (maybeStrict && !developer) {
            throw new InternalServerError("errors.developer_account_can't_be_located_for_user");
        }

        return developer ?? undefined;
    }

    public async registerAccount(
        ctx: RequestContext,
        input: RegisterDeveloperAccountDtoType['input'],
    ): Promise<SuccessResponse | MissingPasswordError | PasswordValidationError | EmailAddressConflictError> {
        if (!input.password) {
            return new MissingPasswordError();
        }
        let user = await this.userService.getUserByIdentifier(ctx, input.emailAddress);
        if (user) {
            const hasAuthMethod = this.userService.hasCredentialsAuthMethod(user);
            if (hasAuthMethod && user.isVerified)
                return {
                    success: true,
                };
        }

        const foundDeveloper = await this.databaseService.getRepository(ctx, Developer).findOne({
            where: {
                emailAddress: normalizeInput(input.emailAddress),
            },
        });
        if (foundDeveloper) {
            return new EmailAddressConflictError();
        }

        const passwordValidationResult = await this.userService.validatePassword(ctx, input.password);
        if (passwordValidationResult !== true) return passwordValidationResult;

        const developer = await this.databaseService.getRepository(ctx, Developer).save(
            new Developer({
                emailAddress: normalizeInput(input.emailAddress),
                firstName: input.firstName || '',
                lastName: input.lastName || '',
            }),
        );

        if (!user) {
            // create customer user
            const customerUserResult = await this.userService.createDeveloperUser(ctx, {
                identifier: input.emailAddress,
                password: input.password,
            });
            if (isApiError(customerUserResult)) return customerUserResult;
            user = customerUserResult;
        }

        // check if the user has credentials auth method
        if (!this.userService.hasCredentialsAuthMethod(user)) {
            const assignCredentialsAuthMethodResult =
                await this.userService.assignCredentialsAuthMethodToUser(ctx, user, {
                    identifier: input.emailAddress,
                    password: input.password,
                });
            if (isApiError(assignCredentialsAuthMethodResult)) return assignCredentialsAuthMethodResult;

            user = assignCredentialsAuthMethodResult;
        }

        // check if user is not verified and verification is required and create new token
        if (!user.isVerified && this.configService.authOptions.requireVerification) {
            user = await this.userService.generateAndAssignVerificationToken(ctx, user);
        }

        developer.user = user;
        await this.databaseService.getRepository(ctx, User).save(user, {
            reload: false,
        });
        await this.databaseService.getRepository(ctx, Developer).save(developer, {
            reload: false,
        });

        if (!user.isVerified) {
            await this.eventBus.publish(new AccountRegistrationEvent(ctx, user));
        }

        return {
            success: true,
        };
    }

    public async refreshVerificationToken(
        ctx: RequestContext,
        input: RefreshVerificationTokenDtoType['input'],
    ): Promise<void> {
        const user = await this.userService.getUserByIdentifier(ctx, input.emailAddress);

        if (user && !user.isVerified) {
            await this.userService.refreshVerificationToken(ctx, user);
            await this.eventBus.publish(new AccountRegistrationEvent(ctx, user));
        }
    }

    public async verifyAccount(
        ctx: RequestContext,
        input: VerifyAccountDtoType['input'],
    ): Promise<Developer | VerificationTokenInvalidError | VerificationTokenExpiredError> {
        const result = await this.userService.verifyDeveloperAccount(ctx, input.token);
        if (isApiError(result)) return result;
        const developer = await this.getOneByUserId(ctx, result.id);
        if (!developer) {
            throw new InternalServerError("errors.developer_account_can't_be_located_for_user");
        }
        await this.eventBus.publish(new AccountVerifiedEvent(ctx, developer));

        return developer;
    }

    public async requestPasswordReset(
        ctx: RequestContext,
        input: RequestPasswordResetDtoType['input'],
    ): Promise<void> {
        const user = await this.userService.generateAndSetPasswordResetToken(ctx, input.emailAddress);
        if (user) {
            await this.eventBus.publish(new PasswordResetRequestedEvent(ctx, user));
        }
    }

    public async resetPassword(
        ctx: RequestContext,
        input: ResetPasswordDtoType['input'],
    ): Promise<
        User | PasswordResetTokenExpiredError | PasswordResetTokenInvalidError | PasswordValidationError
    > {
        const result = await this.userService.resetAccountPassword(ctx, input.token, input.newPassword);
        if (isApiError(result)) return result;
        await this.eventBus.publish(new PasswordResetVerifiedEvent(ctx, result));
        return result;
    }

    public async requestEmailAddressChange(
        ctx: RequestContext,
        userId: string,
        input: RequestEmailAddressChangeDtoType['input'],
    ): Promise<EmailAddressConflictError | boolean> {
        const normalizedEmailAddress = normalizeInput(input.newEmailAddress);
        const foundUserWithEmailAddress = await this.userService.getUserByIdentifier(
            ctx,
            input.newEmailAddress,
        );
        if (foundUserWithEmailAddress) {
            return new EmailAddressConflictError();
        }
        const user = await this.userService.getUserById(ctx, userId);
        if (!user) return false;

        if (this.configService.authOptions.requireVerification) {
            user.getNativeAuthenticationMethod().identifierPlaceholder = normalizedEmailAddress;
            await this.userService.generateAndSetIdentifierChangeToken(ctx, user);
            await this.eventBus.publish(new IdentifierChangeRequestedEvent(ctx, user));
            return true;
        } else {
            const developer = await this.getOneByUserId(ctx, user.id);
            if (!developer) return false;
            const oldIdentifier = user.identifier;
            user.identifier = normalizedEmailAddress;
            developer.emailAddress = normalizedEmailAddress;
            await this.databaseService.getRepository(ctx, User).save(user, { reload: false });
            await this.databaseService.getRepository(ctx, Developer).save(developer, { reload: false });
            await this.eventBus.publish(new IdentifierChangedEvent(ctx, user, oldIdentifier));

            return true;
        }
    }

    public async changeEmailAddress(
        ctx: RequestContext,
        input: ChangeEmailAddressDtoType['input'],
    ): Promise<boolean | IdentifierChangeTokenInvalidError | IdentifierChangeTokenExpiredError> {
        const result = await this.userService.changeIdentifier(ctx, input.token);
        if (isApiError(result)) return result;
        if (!result.user) return false;

        const developer = await this.getOneByUserId(ctx, result.user.id);
        if (!developer) return false;

        await this.eventBus.publish(new IdentifierChangedEvent(ctx, result.user, result.oldIdentifier));

        developer.emailAddress = result.user.identifier;
        await this.databaseService.getRepository(ctx, Developer).save(developer, { reload: false });

        return true;
    }

    public async update(
        ctx: RequestContext,
        input: UpdateDeveloperAccountDtoType['input'] & { id: string },
    ): Promise<Developer> {
        // the current implementation accounts for a developer updating his own account.
        // in the future, it should be extended to handle the case in which the admin updates
        // the account without restrictions (emailAddress is allowed, ..etc)

        if ('emailAddress' in input || 'deletedAt' in input) {
            throw new UserInputError('errors.invalid_input_fields');
        }

        const repo = this.databaseService.getRepository(ctx, Developer);

        let developer = await this.findOne(
            ctx,
            { id: input.id },
            {
                user: {
                    roles: true,
                    authenticationMethods: true,
                },
            },
            {
                includePrivateDevelopers: true,
                includeSoftDeleted: false,
            },
        );

        if (!developer || (ctx.isAuthorizedAsOwnerOnly && developer.user.id !== ctx.activeUserId)) {
            throw new EntityNotFoundError({ entityId: input.id, entityName: 'Developer' });
        }

        developer = patchEntity(developer, input);

        await repo.save(developer, { reload: false });

        await this.eventBus.publish(new DeveloperEvent(ctx, developer, 'updated', input));

        return developer;
    }

    public async softDelete(
        ctx: RequestContext,
        developerId: string,
    ): Promise<DeleteDeveloperAccountDtoType['output']> {
        const repo = this.databaseService.getRepository(ctx, Developer);

        const developer = await this.findOne(ctx, { id: developerId }, undefined, {
            includePrivateDevelopers: true,
            includeSoftDeleted: false,
        });

        if (!developer || (ctx.isAuthorizedAsOwnerOnly && developer.user.id !== ctx.activeUserId)) {
            throw new EntityNotFoundError({ entityName: 'Developer', entityId: developerId });
        }

        await repo.update({ id: developerId }, { deletedAt: new Date() });

        if (developer.user) {
            await this.userService.softDelete(ctx, developer.user.id);
        }

        await this.eventBus.publish(new DeveloperEvent(ctx, developer, 'deleted', { id: developerId }));

        return { result: 'DELETED', message: '' };
    }

    public async restoreAccount(ctx: RequestContext, userId: string): Promise<boolean> {
        const developer = await this.getOneByUserId(ctx, userId, undefined, {
            includeSoftDeleted: true,
            includePrivateDevelopers: true,
        });

        if (!developer || (ctx.isAuthorizedAsOwnerOnly && developer.user.id !== ctx.activeUserId))
            return false;

        await this.databaseService.getRepository(ctx, User).update({ id: userId }, { deletedAt: null });
        await this.databaseService
            .getRepository(ctx, Developer)
            .update({ id: developer.id }, { deletedAt: null, scheduledDeletionAt: null });

        return true;
    }

    public async create(
        ctx: RequestContext,
        input: CreateDeveloperDtoType['input'],
        password?: string,
    ): Promise<Developer | EmailAddressConflictError> {
        input.emailAddress = normalizeInput(input.emailAddress);
        const developer = new Developer(input);

        const existingDeveloper = await this.databaseService.getRepository(ctx, Developer).findOne({
            where: {
                emailAddress: input.emailAddress,
                deletedAt: IsNull(),
            },
        });

        if (existingDeveloper) {
            return new EmailAddressConflictError();
        }

        const developerUser = await this.userService.createDeveloperUser(ctx, {
            password,
            identifier: input.emailAddress,
        });

        if (isApiError(developerUser)) {
            // eslint-disable-next-line @typescript-eslint/only-throw-error
            throw developerUser;
        }
        developer.user = developerUser;

        if (password && password !== '') {
            const verificationToken = developer.user.getNativeAuthenticationMethod().verificationToken;
            if (verificationToken) {
                const result = await this.userService.verifyDeveloperAccount(ctx, verificationToken);
                if (isApiError(result)) {
                    // In theory this should never be reached, so we will just
                    // throw the result
                    // eslint-disable-next-line @typescript-eslint/only-throw-error
                    throw result;
                } else {
                    developer.user = result;
                }
            }
        }
        developer.user.roles = developerUser.roles;
        await this.eventBus.publish(new AccountRegistrationEvent(ctx, developer.user));
        const createdDeveloper = await this.databaseService.getRepository(ctx, Developer).save(developer);
        await this.eventBus.publish(new DeveloperEvent(ctx, createdDeveloper, 'created', input));
        return developer;
    }

    public async attachStatsToDevelopersList(
        ctx: RequestContext,
        items: Developer[],
        itemsCount: number,
        options?: { includePrivateSnippets?: boolean; includePrivateCollections?: boolean },
    ) {
        const developerIds = items.map(({ id }) => id);

        const [snippetCounts, collectionCounts, addedTags] = await Promise.all([
            this.snippetService.countDevelopersSnippets(ctx, developerIds, options),
            this.collectionService.countDevelopersCollections(ctx, developerIds, options),
            this.tagService.countDevelopersTags(ctx, developerIds),
        ]);

        const snippetCountsByDeveloper = new Map(
            snippetCounts.map(({ developerId, count }) => [developerId, Number(count)]),
        );
        const collectionCountsByDeveloper = new Map(
            collectionCounts.map(({ developerId, count }) => [developerId, Number(count)]),
        );
        const tagsByDeveloper = new Map<string, Array<{ id: string; value: string; usageCount: number }>>();

        for (const { developerId, id, value, usageCount } of addedTags) {
            const tags = tagsByDeveloper.get(developerId) ?? [];
            tags.push({ id, value, usageCount: Number(usageCount) });
            tagsByDeveloper.set(developerId, tags);
        }

        const enrichedItems = items.map(item => ({
            ...item,
            snippetsCount: snippetCountsByDeveloper.get(item.id) ?? 0,
            collectionsCount: collectionCountsByDeveloper.get(item.id) ?? 0,
            tags: tagsByDeveloper.get(item.id) ?? [],
        }));

        return { items: enrichedItems, itemsCount };
    }

    public async getProfileActivityStats(
        ctx: RequestContext,
        developerId: string,
        options?: { includePrivate?: boolean; includeSoftDeleted?: boolean },
    ) {
        const [snippetsCount, collectionsCount, forkedSnippetsCount, forkedCollectionsCount, friendships] =
            await Promise.all([
                this.snippetService
                    .countDevelopersSnippets(ctx, [developerId], {
                        includePrivateSnippets: options?.includePrivate,
                        includeSoftDeleted: options?.includeSoftDeleted,
                    })
                    .then(data => data[0]?.count),
                this.collectionService
                    .countDevelopersCollections(ctx, [developerId], {
                        includePrivateCollections: options?.includePrivate,
                        includeSoftDeleted: options?.includeSoftDeleted,
                    })
                    .then(data => data[0]?.count),
                this.snippetService
                    .countDevelopersForkedSnippets(ctx, [developerId], {
                        includePrivateSnippets: options?.includePrivate,
                        includeSoftDeleted: options?.includeSoftDeleted,
                    })
                    .then(data => data[0]?.count),
                this.collectionService
                    .countDevelopersForkedCollections(ctx, [developerId], {
                        includePrivateCollections: options?.includePrivate,
                        includeSoftDeleted: options?.includeSoftDeleted,
                    })
                    .then(data => data[0]?.count),
                this.friendshipService.countDeveloperFriendships(ctx, developerId),
            ]);

        return {
            snippetsCount,
            collectionsCount,
            forkedSnippetsCount,
            forkedCollectionsCount,
            friendsCount: friendships.friendsCount,
            friendsInboxCount: friendships.friendsInboxCount,
            friendsOutboxCount: friendships.friendsOutboxCount,
        };
    }
}
