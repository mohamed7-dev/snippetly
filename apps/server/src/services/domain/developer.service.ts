import {
    ChangeEmailAddressDtoType,
    CreateDeveloperDtoType,
    DeleteDeveloperAccountDtoType,
    DeveloperListDtoType,
    RefreshVerificationTokenDtoType,
    RegisterDeveloperAccountDtoType,
    RequestEmailAddressChangeDtoType,
    RequestPasswordResetDtoType,
    ResetPasswordDtoType,
    SuccessResponse,
    UpdateDeveloperAccountDtoType,
    VerifyAccountDtoType,
} from '@snippetly/common/dto';
import { FindOptionsRelations, IsNull } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { ErrorResultUnion, isApiError } from '../../common/errors/api-error';
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
import { EmailClient } from '../helpers/email-client.service';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder.service';
import { UserService } from './user.service';

@Injectable()
export class DeveloperService implements OnApplicationBootstrap {
    constructor(
        private readonly userService: UserService,
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly listQueryBuilder: ListQueryBuilder,
        private readonly eventBus: EventBus,
        private readonly emailClient: EmailClient,
    ) {}

    /**@internal */
    onApplicationBootstrap() {
        this.subscribeToAccountRegistrationEvent();
        this.subscribeToPasswordResetRequestedEvent();
        this.subscribeToIdentifierChangeRequestedEvent();
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
        if (!user.isVerified) {
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

        let developer = await repo.findOne({
            where: {
                id: input.id,
            },
            relations: {
                user: true,
            },
        });

        if (!developer || developer.user.id !== ctx.activeUserId) {
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

        const developer = await repo.findOne({
            where: {
                id: developerId,
            },
        });

        if (!developer || developer.user.id !== ctx.activeUserId) {
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
        const developer = await this.databaseService.getRepository(ctx, Developer).findOne({
            where: {
                user: {
                    id: userId,
                },
            },
            withDeleted: true,
        });

        if (!developer) return false;

        await this.databaseService.getRepository(ctx, User).update({ id: userId }, { deletedAt: null });
        await this.databaseService
            .getRepository(ctx, Developer)
            .update({ id: developer.id }, { deletedAt: null });

        return true;
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

        const repo = this.databaseService.getRepository(ctx, Developer);

        const developer = await repo.findOne({
            where: {
                user: {
                    id: ctx.activeUserId,
                },
            },
        });

        if (maybeStrict && !developer) {
            throw new InternalServerError("errors.developer_account_can't_be_located_for_user");
        }

        return developer ?? undefined;
    }

    public async findOne(
        ctx: RequestContext,
        id: string,
        relations?: FindOptionsRelations<Developer>,
    ): Promise<Developer | undefined> {
        const repo = this.databaseService.getRepository(ctx, Developer);
        const developer = await repo.findOne({
            where: {
                id,
                deletedAt: IsNull(),
            },
            relations: {
                ...relations,
            },
        });

        return developer ?? undefined;
    }

    public async find(
        ctx: RequestContext,
        input: DeveloperListDtoType['input'],
        relations?: FindOptionsRelations<Developer>,
    ) {
        const qb = this.listQueryBuilder.build(Developer, input, {
            ctx,
            relations,
            where: { deletedAt: IsNull() },
        });

        const [items, itemsCount] = await qb.getManyAndCount();
        return { items, itemsCount };
    }

    async getOneByUserId(
        ctx: RequestContext,
        userId: string,
        relations?: FindOptionsRelations<Developer>,
    ): Promise<Developer | undefined>;
    async getOneByUserId(
        userId: string,
        relations?: FindOptionsRelations<Developer>,
    ): Promise<Developer | undefined>;
    async getOneByUserId(
        ctx: RequestContext | null,
        userId: string,
        relations?: FindOptionsRelations<Developer>,
    ): Promise<Developer | undefined>;
    public async getOneByUserId(
        ctxOrUserId: RequestContext | string | null,
        maybeUserIdOrRelations?: string | FindOptionsRelations<Developer>,
        relations?: FindOptionsRelations<Developer>,
    ): Promise<Developer | undefined> {
        const hasContext = ctxOrUserId instanceof RequestContext || ctxOrUserId === null;
        const ctx = hasContext ? ctxOrUserId : undefined;
        const userId = hasContext ? (maybeUserIdOrRelations as string) : ctxOrUserId;
        const resolvedRelations = hasContext
            ? relations
            : (maybeUserIdOrRelations as FindOptionsRelations<Developer> | undefined);
        const repo = this.databaseService.getRepository(ctx ?? undefined, Developer);

        const developer = await repo.findOne({
            where: {
                user: {
                    id: userId,
                },
                deletedAt: IsNull(),
            },
            relations: {
                ...resolvedRelations,
            },
        });

        return developer ?? undefined;
    }

    public async create(
        ctx: RequestContext,
        input: CreateDeveloperDtoType['input'],
        password?: string,
    ): Promise<ErrorResultUnion<CreateDeveloperDtoType['output'], Developer>> {
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
        await this.eventBus.publish(new AccountRegistrationEvent(ctx, developer.user));
        const createdDeveloper = await this.databaseService.getRepository(ctx, Developer).save(developer);
        await this.eventBus.publish(new DeveloperEvent(ctx, createdDeveloper, 'created', input));
        return createdDeveloper;
    }
}
