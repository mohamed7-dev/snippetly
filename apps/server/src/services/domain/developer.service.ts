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
import { ConfigService } from '../../config/config.service';
import { Developer } from '../../entities/developer/developer.entity';
import { Friendship } from '../../entities/friendships/friendship.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { patchEntity } from '../../infra/database/patch-entity';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { AccountRegisteredEvent } from '../../infra/event-bus/events/account-registered.event';
import { AccountRegistrationEvent } from '../../infra/event-bus/events/account-registration.eveny';
import { AccountVerifiedEvent } from '../../infra/event-bus/events/account-verified.event';
import { AppJobEvent } from '../../infra/event-bus/events/app-job.event';
import { DeveloperEvent } from '../../infra/event-bus/events/developer.event';
import { IdentifierChangeRequestedEvent } from '../../infra/event-bus/events/identifier-change-requested.event';
import { IdentifierChangedEvent } from '../../infra/event-bus/events/identifier-changed.event';
import { PasswordResetRequestedEvent } from '../../infra/event-bus/events/password-reset-requested.event';
import { PasswordResetVerifiedEvent } from '../../infra/event-bus/events/password-reset-verified.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { moduleRef } from '../../infra/ioc-container/module-ref';
import { JobQueue } from '../../infra/job-queue/job-qeueue.service';
import { AppJob } from '../../infra/job-queue/types';
import { Logger } from '../../infra/logger/logger';
import { EmailClient } from '../helpers/email-client.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { RequestContextService } from '../helpers/request-context.service';
import type { CollectionService } from './collection.service';
import { FavouriteService } from './favourite.service';
import { FriendshipService } from './friendship.service';
import type { SnippetService } from './snippet.service';
import { TagService } from './tag.service';
import { UserService } from './user.service';

const MAX_JOB_DELAY_SECONDS = 7 * 24 * 60 * 60 - 60;

@Injectable()
export class DeveloperService implements OnApplicationBootstrap {
    /** Resolves the snippet service without creating a circular dependency. */
    private get snippetService(): SnippetService {
        const { SnippetService } = require('./snippet.service') as typeof import('./snippet.service');
        return moduleRef.getProvider<SnippetService>(SnippetService);
    }

    /** Resolves the collection service without creating a circular dependency. */
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
        private readonly favouriteService: FavouriteService,
        private readonly requestContextService: RequestContextService,
    ) {}

    /**
     * @description
     * Registers event subscriptions and job handlers when the app starts.
     * @internal
     */
    onApplicationBootstrap() {
        this.subscribeToAccountRegistrationEvent();
        this.subscribeToPasswordResetRequestedEvent();
        this.subscribeToIdentifierChangeRequestedEvent();
        this.subscribeToAccountRegisteredEvent();
        this.registerJobHandler();
        this.registerAccountDeletionJobHandler();
    }

    /** Registers the handler that runs queued developer-related jobs. */
    private registerJobHandler() {
        this.eventBus.registerSyncHandler({
            event: AppJobEvent,
            id: 'developer-service-job-handler',
            handler: async appJobEvent => {
                const { job } = appJobEvent;
                switch (job.type) {
                    case 'delete-developer-account':
                        await this.processDeveloperAccountDeletionJob(job);
                        break;
                    case 'send-account-welcome-email':
                        await this.sendAccountWelcomeEmail(job, appJobEvent);
                        break;
                    case 'send-account-goodbye-email':
                        await this.sendAccountGoodbyeEmail(job, appJobEvent);
                        break;
                }
            },
        });
    }

    /** Schedules final account deletion and a goodbye email after a soft delete. */
    private registerAccountDeletionJobHandler() {
        this.eventBus.registerSyncHandler({
            event: DeveloperEvent,
            id: 'developer-service-account-deletion-handler',
            handler: async event => {
                if (event.type !== 'soft-deleted' || !event.entity.user) return;

                const scheduledDeletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                await this.databaseService
                    .getRepository(event.ctx, Developer)
                    .update({ id: event.entity.id }, { scheduledDeletionAt });
                await this.jobQueue.enqueue(
                    {
                        type: 'delete-developer-account',
                        userId: event.entity.user.id,
                        deleteAfter: scheduledDeletionAt.getTime(),
                    },
                    7 * 24 * 60 * 60,
                );
                await this.jobQueue.enqueue(
                    { type: 'send-account-goodbye-email', userId: event.entity.user.id },
                    10,
                );
            },
        });
    }

    /** Deletes an account after its grace period, or reschedules while time remains. */
    private async processDeveloperAccountDeletionJob(
        job: Extract<AppJob, { type: 'delete-developer-account' }>,
    ) {
        const userRepo = this.databaseService.getRepository(User);
        const user = await userRepo.findOne({
            where: { id: job.userId },
            withDeleted: true,
        });
        if (!user?.deletedAt) return;

        const developerRepo = this.databaseService.getRepository(Developer);
        const developer = await developerRepo.findOne({
            where: { user: { id: job.userId } },
            withDeleted: true,
        });
        if (!developer?.deletedAt || developer.scheduledDeletionAt?.getTime() !== job.deleteAfter) return;

        const remainingSeconds = Math.ceil((job.deleteAfter - Date.now()) / 1000);
        if (remainingSeconds > 0) {
            await this.jobQueue.enqueue(job, Math.min(remainingSeconds, MAX_JOB_DELAY_SECONDS));
            return;
        }

        await userRepo.delete(job.userId);
        await this.eventBus.publish(
            new DeveloperEvent(
                this.requestContextService.create({ apiType: 'developer' }),
                developer,
                'deleted',
                { id: job.userId },
            ),
        );
    }

    /** Sends a welcome email if the developer account still exists and is active. */
    private async sendAccountWelcomeEmail(
        job: Extract<AppJob, { type: 'send-account-welcome-email' }>,
        event: AppJobEvent,
    ): Promise<void> {
        const developer = await this.databaseService.getRepository(Developer).findOne({
            where: { user: { id: job.userId }, deletedAt: IsNull() },
            relations: { user: true },
        });
        if (!developer) return;

        await this.emailClient.sendEmail({
            event,
            to: developer.user.identifier,
            subject: 'Welcome to Snippetly',
            html: `<p>Hi ${this.escapeHtml(developer.firstName)},</p><p>Welcome to Snippetly! Your account is ready. Start creating and sharing code snippets with your friends.</p>`,
        });
    }

    /** Sends a goodbye email only while the account is still soft-deleted. */
    private async sendAccountGoodbyeEmail(
        job: Extract<AppJob, { type: 'send-account-goodbye-email' }>,
        event: AppJobEvent,
    ): Promise<void> {
        const developer = await this.databaseService.getRepository(Developer).findOne({
            where: { user: { id: job.userId } },
            relations: { user: true },
            withDeleted: true,
        });
        if (!developer?.deletedAt || !developer.user?.deletedAt) return;

        await this.emailClient.sendEmail({
            event,
            to: developer.user.identifier,
            subject: 'Your Snippetly account was deleted',
            html: `<p>Hi ${this.escapeHtml(developer.firstName)},</p><p>Your Snippetly account has been deleted. We’re sorry to see you go.</p><p>If you changed your mind, you can restore your account within 30 days by signing in again.</p>`,
        });
    }

    /** Escapes text before including it in an HTML email. */
    private escapeHtml(value: string): string {
        return value.replace(/[&<>"']/g, character => {
            const entities: Record<string, string> = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            };
            return entities[character] ?? character;
        });
    }

    /** Sends verification email when an unverified developer account has a token. */
    private subscribeToAccountRegistrationEvent() {
        this.eventBus.ofType(AccountRegistrationEvent).subscribe(event => {
            const verificationToken = event.user.getNativeAuthenticationMethod({
                throwError: false,
            })?.verificationToken;
            if (event.ctx.apiType === 'developer' && verificationToken) {
                Logger.debug(`Handling event 'AccountRegistrationEvent'`);
                const callbackUrl = `${this.configService.systemOptions.email.accountVerificationCallbackUrl}?token=${verificationToken}`;
                void this.emailClient
                    .sendEmail({
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
                    })
                    .catch(error => this.logEventHandlerError('sending account verification email', error));
            }
        });
    }

    /** Queues a welcome email after a developer account is registered. */
    private subscribeToAccountRegisteredEvent() {
        this.eventBus.ofType(AccountRegisteredEvent).subscribe(event => {
            void this.jobQueue
                .enqueue({ type: 'send-account-welcome-email', userId: event.user.id }, 10)
                .catch(error => this.logEventHandlerError('queuing the welcome email', error));
        });
    }

    /** Sends an email containing the password-reset link. */
    private subscribeToPasswordResetRequestedEvent() {
        this.eventBus.ofType(PasswordResetRequestedEvent).subscribe(event => {
            Logger.debug(`Handling event 'PasswordResetRequestedEvent'`);
            const callbackUrl = `${this.configService.systemOptions.email.passwordResetCallbackUrl}?token=${event.user.getNativeAuthenticationMethod().passwordResetToken}`;
            void this.emailClient
                .sendEmail({
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
                })
                .catch(error => this.logEventHandlerError('sending a password reset email', error));
        });
    }

    /** Sends an email containing the identifier-change confirmation link. */
    private subscribeToIdentifierChangeRequestedEvent() {
        this.eventBus.ofType(IdentifierChangeRequestedEvent).subscribe(event => {
            Logger.debug(`Handling event 'IdentifierChangeRequestedEvent'`);
            const nativeAuthMethod = event.user.getNativeAuthenticationMethod();
            if (
                !nativeAuthMethod ||
                !nativeAuthMethod.identifierChangeToken ||
                !nativeAuthMethod.identifierPlaceholder
            )
                return;
            const { identifierChangeToken, identifierPlaceholder } = nativeAuthMethod;
            const callbackUrl = `${this.configService.systemOptions.email.identifierChangeCallbackUrl}?token=${identifierChangeToken}`;
            void this.emailClient
                .sendEmail({
                    event,
                    to: identifierPlaceholder,
                    subject: 'Email-address Change Request',
                    html: `
                    <a font-family="Helvetica"
                        background-color="#f45e43"
                        color="white"
                        href="${callbackUrl}">
                            Change Email-address!
                    </a>
                
                `,
                })
                .catch(error => this.logEventHandlerError('sending an identifier change email', error));
        });
    }

    /** Logs failures from event-stream callbacks that run outside the event bus publish flow. */
    private logEventHandlerError(action: string, error: unknown): void {
        const message = error instanceof Error ? error.message : String(error);
        const trace = error instanceof Error ? error.stack : undefined;
        Logger.error(`Failed ${action}: ${message}`, 'DeveloperService', trace);
    }

    /**
     * @description
     * Lists developers using the supplied filters and excludes accepted friends from discovery.
     */
    public async find(
        ctx: RequestContext,
        input: DeveloperListDtoType['input'],
        activeDeveloper?: Developer,
        relations?: FindOptionsRelations<Developer>,
        options?: { includePrivateDevelopers?: boolean; includeSoftDeleted?: boolean },
    ) {
        const qb = this.listQueryBuilder.build(Developer, input as any, {
            ctx,
            relations: { user: true, ...relations },
            where: {
                ...(options?.includeSoftDeleted ? {} : { deletedAt: IsNull() }),
                ...(options?.includePrivateDevelopers ? {} : { isPrivate: false }),
            },
        });

        const resolvedActiveDeveloper = input.discover ? activeDeveloper : undefined;

        if (resolvedActiveDeveloper) {
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
                            activeDeveloperId: resolvedActiveDeveloper.id,
                        }).orWhere('addressee.id = :activeDeveloperId', {
                            activeDeveloperId: resolvedActiveDeveloper.id,
                        });
                    }),
                )
                .andWhere('friendship.status = :acceptedStatus', {
                    acceptedStatus: FriendshipStatus.Accepted,
                })
                .getRawMany<{ requesterId: string; addresseeId: string }>();
            const excludedDeveloperIds = [
                resolvedActiveDeveloper.id,
                ...friendships.map(({ requesterId, addresseeId }) =>
                    requesterId === resolvedActiveDeveloper.id ? addresseeId : requesterId,
                ),
            ];

            qb.andWhere(`${qb.alias}.id NOT IN (:...excludedDeveloperIds)`, { excludedDeveloperIds });
        }

        const [items, itemsCount] = await qb.getManyAndCount();
        return { items: items.map(item => ({ ...item, isVerified: item.isVerified })), itemsCount };
    }

    /**
     * @description
     * Adds each developer's friendship status with the active developer.
     */
    public async attachFriendshipInfoToDevelopersList<T extends { id: string; isVerified: boolean }>(
        ctx: RequestContext,
        items: T[],
        activeDeveloper?: Developer,
    ) {
        let friendshipInfoByDeveloper = new Map<
            string,
            { isFriendWithCurrentUser: boolean; friendshipStatus: FriendshipStatus }
        >();

        if (activeDeveloper && items.length) {
            const developerIds = items.map(({ id }) => id);
            friendshipInfoByDeveloper = await this.friendshipService.getFriendshipInfoWithActiveDeveloper(
                ctx,
                activeDeveloper.id,
                developerIds,
            );
        }

        const enrichedItems = items.map(item => ({
            ...item,
            friendshipInfo: friendshipInfoByDeveloper.get(item.id) ?? {
                isFriendWithCurrentUser: false,
                friendshipStatus: null,
            },
        }));

        return enrichedItems;
    }

    /**
     * @description
     * Finds a developer by ID, respecting privacy and soft-delete options.
     */
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
            relations,
        });

        return developer ?? undefined;
    }

    /**
     * @description
     * Finds a developer linked to a user, respecting privacy and soft-delete options.
     */
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
    /**
     * @description
     * Gets the signed-in user's developer account, optionally requiring it to exist.
     */
    public async getActiveDeveloper(
        ctx: RequestContext,
        maybeStrict?: boolean,
    ): Promise<Developer | undefined> {
        if (!ctx.activeUserId && maybeStrict) {
            throw new ForbiddenError();
        } else if (!ctx.activeUserId) {
            return undefined;
        }

        const developer = await this.getOneByUserId(
            ctx,
            ctx.activeUserId,
            { user: true },
            {
                includeSoftDeleted: false,
                includePrivateDevelopers: true,
            },
        );

        if (maybeStrict && !developer) {
            throw new InternalServerError("errors.developer_account_can't_be_located_for_user");
        }

        return developer ?? undefined;
    }

    /**
     * @description
     * Registers a developer account and emits events for verification and welcome emails.
     *
     * :::info
     * - it emits AccountRegistrationEvent when `configService.authOptions.requireVerification` is set to true
     * so that the consumer can send the token via email address.
     * - it emits AccountRegisteredEvent so that the consumer can send welcome email.
     * :::
     */
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
            if (hasAuthMethod && user.isVerified) {
                return {
                    success: true,
                };
            }
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
            // create developer user
            const developerUserResult = await this.userService.createDeveloperUser(ctx, {
                identifier: input.emailAddress,
                password: input.password,
            });
            if (isApiError(developerUserResult)) return developerUserResult;
            user = developerUserResult;
        }

        // check if the user has native auth method
        if (!this.userService.hasCredentialsAuthMethod(user)) {
            const assignCredentialsAuthMethodResult =
                await this.userService.assignCredentialsAuthMethodToUser(ctx, user, {
                    identifier: input.emailAddress,
                    password: input.password,
                });
            if (isApiError(assignCredentialsAuthMethodResult)) return assignCredentialsAuthMethodResult;

            user = assignCredentialsAuthMethodResult;
        }

        // Ensure unverified users who require verification have a token without rotating one
        // that was already issued while assigning their credentials auth method.
        if (!user.isVerified && this.configService.authOptions.requireVerification) {
            const nativeAuthMethod = user.getNativeAuthenticationMethod();
            if (!nativeAuthMethod.verificationToken) {
                user = await this.userService.generateAndAssignVerificationToken(ctx, user);
            }
        }

        developer.user = user;
        await this.databaseService.getRepository(ctx, User).save(user, {
            reload: false,
        });
        await this.databaseService.getRepository(ctx, Developer).save(developer, {
            reload: false,
        });

        if (user.getNativeAuthenticationMethod({ throwError: false })?.verificationToken) {
            await this.eventBus.publish(new AccountRegistrationEvent(ctx, user));
        }
        await this.eventBus.publish(new AccountRegisteredEvent(ctx, user));

        return {
            success: true,
        };
    }

    /**
     * @description
     * Reissues a verification token for an unverified account and requests its email.
     *
     * :::info
     * it emits AccountRegistrationEvent so that the consumer can send the token via email address.
     * :::
     */
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

    /**
     * @description
     * Verifies an account and emits an event for follow-up actions.
     *
     * :::info
     *  it emits AccountVerifiedEvent
     * :::
     */
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

    /**
     * @description
     * Creates a password-reset token and requests its delivery by email.
     *
     * :::info
     *  it emits PasswordResetRequestedEvent so that the consumer can send the token via email address.
     * :::
     */
    public async requestPasswordReset(
        ctx: RequestContext,
        input: RequestPasswordResetDtoType['input'],
    ): Promise<void> {
        const user = await this.userService.generateAndSetPasswordResetToken(ctx, input.emailAddress);
        if (user) {
            await this.eventBus.publish(new PasswordResetRequestedEvent(ctx, user));
        }
    }

    /**
     * @description
     * Resets a user's password and emits an event after a successful reset.
     *
     * :::info
     *  it emits PasswordResetVerifiedEvent.
     * :::
     */
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

    /**
     * @description
     * Starts an email change, requiring confirmation when verification is enabled.
     *
     * :::info
     *  - it emits IdentifierChangeRequestedEvent when `configService.authOptions.requireVerification` is set to true.
     *  - it emits IdentifierChangedEvent when `configService.authOptions.requireVerification` is set to false.
     * :::
     */
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
            // user should verify this account later on
            user.isVerified = false;
            developer.emailAddress = normalizedEmailAddress;

            await this.databaseService.getRepository(ctx, User).save(user, { reload: false });
            await this.databaseService.getRepository(ctx, Developer).save(developer, { reload: false });
            await this.eventBus.publish(new IdentifierChangedEvent(ctx, user, oldIdentifier));

            return true;
        }
    }

    /**
     * @description
     * Confirms an email change using its token and updates the developer record.
     *
     * :::info
     *  it emits IdentifierChangedEvent.
     * :::
     */
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

    /**
     * @description
     * Updates a developer account and publishes an update event.
     *
     * :::info
     *  it emits DeveloperEvent.
     * :::
     */
    public async update(
        ctx: RequestContext,
        input: UpdateDeveloperAccountDtoType['input'] & { id: string },
    ): Promise<Developer> {
        // the current implementation accounts for a developer updating his own account.
        // in the future, it should be extended to handle the case in which the admin updates
        // the account without restrictions (emailAddress is allowed, ..etc)

        if (ctx.apiType === 'developer' && 'emailAddress' in input) {
            throw new UserInputError('errors.invalid_input_fields', {
                emailAddress: 'Email address can be updated only through the identifier change workflow.',
            });
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

    /**
     * @description
     * Soft-deletes a developer and user account, then schedules cleanup.
     *
     * :::info
     *  it emits DeveloperEvent.
     * :::
     */
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

        await this.eventBus.publish(new DeveloperEvent(ctx, developer, 'soft-deleted', { id: developerId }));

        return { result: 'DELETED', message: '' };
    }

    /**
     * @description
     * Restores a soft-deleted developer account before its scheduled removal.
     *
     * :::info
     *  it emits DeveloperEvent.
     * :::
     */
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

        await this.eventBus.publish(new DeveloperEvent(ctx, developer, 'restored', { id: developer.id }));

        return true;
    }

    /**
     * @description
     * Creates a developer, optionally setting a password and verifying the account.
     *
     * :::info
     *  it emits DeveloperEvent.
     * :::
     */
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
        const createdDeveloper = await this.databaseService.getRepository(ctx, Developer).save(developer);
        await this.eventBus.publish(new DeveloperEvent(ctx, createdDeveloper, 'created', input));
        return developer;
    }

    /**
     * @description
     * Adds public or configured snippet and collection counts to developers.
     */
    public async attachActivityStatsToDevelopersList<T extends Developer>(
        ctx: RequestContext,
        items: T[],
        options?: { includePrivateSnippets?: boolean; includePrivateCollections?: boolean },
    ) {
        const developerIds = items.map(({ id }) => id);

        const [snippetCounts, collectionCounts] = await Promise.all([
            this.snippetService.countDevelopersSnippets(ctx, developerIds, options),
            this.collectionService.countDevelopersCollections(ctx, developerIds, options),
        ]);

        const snippetCountsByDeveloper = new Map(
            snippetCounts.map(({ developerId, count }) => [developerId, Number(count)]),
        );
        const collectionCountsByDeveloper = new Map(
            collectionCounts.map(({ developerId, count }) => [developerId, Number(count)]),
        );

        const enrichedItems = items.map(item => ({
            ...item,
            activityStats: {
                snippetsCount: snippetCountsByDeveloper.get(item.id) ?? 0,
                collectionsCount: collectionCountsByDeveloper.get(item.id) ?? 0,
            },
        }));

        return enrichedItems;
    }

    /**
     * @description
     * Adds the tags and usage counts associated with each developer.
     */
    public async attachTagsInfoToDevelopersList<T extends { id: string }>(
        ctx: RequestContext,
        developers: T[],
    ) {
        const developerIds = developers.map(({ id }) => id);

        const developersTags = await this.tagService.getDevelopersTags(ctx, developerIds);

        const tagsByDeveloper = new Map<string, Array<{ id: string; value: string; usageCount: number }>>();

        for (const { developerId, id, value, usageCount } of developersTags) {
            const tags = tagsByDeveloper.get(developerId) ?? [];
            tags.push({ id, value, usageCount: Number(usageCount) });
            tagsByDeveloper.set(developerId, tags);
        }

        const enrichedItems = developers.map(developer => ({
            ...developer,
            tags: tagsByDeveloper.get(developer.id) ?? [],
        }));
        return enrichedItems;
    }

    /**
     * @description
     * Adds whether the current user has favourited each developer.
     */
    public async attachFavouriteStatusToDevelopersList<T extends { id: string }>(
        ctx: RequestContext,
        items: T[],
        developer?: Developer,
    ) {
        const currentDeveloper = developer ?? (await this.getActiveDeveloper(ctx));
        const statusById = await this.favouriteService.getFavouriteStatusMapForDeveloper(
            ctx,
            items.map(({ id }) => id),
            'developers',
            currentDeveloper,
        );
        return items.map(item => ({
            ...item,
            isFavouritedByCurrentUser: statusById.get(item.id) ?? false,
        }));
    }

    /**
     * @description
     * Returns content, fork, and friendship counts for a developer.
     */
    public async getDeveloperActivityStats(
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
