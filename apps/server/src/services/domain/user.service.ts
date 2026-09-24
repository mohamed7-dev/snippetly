import { FindOptionsRelations } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { isApiError } from '../../common/errors/api-error';
import { EntityNotFoundError, InternalServerError } from '../../common/errors/errors';
import {
    IdentifierChangeTokenExpiredError,
    IdentifierChangeTokenInvalidError,
    InvalidCredentialsError,
    PasswordResetTokenExpiredError,
    PasswordResetTokenInvalidError,
    PasswordValidationError,
    VerificationTokenExpiredError,
    VerificationTokenInvalidError,
} from '../../common/errors/generated-developer-errors';
import { isEmailAddressLike, normalizeInput } from '../../common/helpers/validation';
import { ConfigService } from '../../config/config.service';
import { NativeAuthenticationMethod } from '../../entities/authentication-method/authentication-method.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { moduleRef } from '../../infra/ioc-container/module-ref';
import { PasswordHashingService } from '../helpers/password-hashing.service';
import { PasswordValidationService } from '../helpers/password-validation.service';
import { VerificationTokenGenerator } from '../helpers/verification-token-generator.service';
import { RoleService } from './role.service';

@Injectable()
export class UserService {
    constructor(
        private readonly passwordHashingService: PasswordHashingService,
        private readonly databaseService: DatabaseService,
        private readonly roleService: RoleService,
        private readonly configService: ConfigService,
        private readonly verificationTokenGenerator: VerificationTokenGenerator,
        private readonly passwordValidationService: PasswordValidationService,
    ) {}

    public async getUserByIdentifier(ctx: RequestContext, identifier: string): Promise<User | undefined> {
        const isEmailIdentifier = isEmailAddressLike(identifier);
        const query = this.databaseService
            .getRepository(ctx, User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.authenticationMethods', 'authMethods')
            .leftJoinAndSelect('user.roles', 'roles')
            .where('user.deletedAt IS NULL')
            .andWhere(
                isEmailIdentifier ? 'LOWER(user.identifier) = :identifier' : 'user.identifier = :identifier',
                { identifier: isEmailIdentifier ? normalizeInput(identifier) : identifier },
            );
        return await query.getOne().then(result => result ?? undefined);
    }

    public async getUserByIdentifierForAuthentication(
        ctx: RequestContext,
        identifier: string,
    ): Promise<User | undefined> {
        const isEmailIdentifier = isEmailAddressLike(identifier);
        const query = this.databaseService
            .getRepository(ctx, User)
            .createQueryBuilder('user')
            .withDeleted()
            .leftJoinAndSelect('user.authenticationMethods', 'authMethods')
            .leftJoinAndSelect('user.roles', 'roles')
            .where(
                isEmailIdentifier ? 'LOWER(user.identifier) = :identifier' : 'user.identifier = :identifier',
                { identifier: isEmailIdentifier ? normalizeInput(identifier) : identifier },
            );
        return await query.getOne().then(result => result ?? undefined);
    }

    public async getUserById(
        ctx: RequestContext,
        userId: string,
        relations?: FindOptionsRelations<User>,
    ): Promise<User | undefined> {
        const foundUser = await this.databaseService.getRepository(ctx, User).findOne({
            where: {
                id: userId,
            },
            relations: {
                roles: true,
                authenticationMethods: true,
                ...relations,
            },
        });

        return foundUser ?? undefined;
    }

    async refreshVerificationToken(ctx: RequestContext, user: User): Promise<User> {
        const nativeAuthMethod = user.getNativeAuthenticationMethod();
        nativeAuthMethod.verificationToken =
            await this.verificationTokenGenerator.generateVerificationToken(ctx);
        user.isVerified = false;
        await this.databaseService.getRepository(ctx, NativeAuthenticationMethod).save(nativeAuthMethod);
        return this.databaseService.getRepository(ctx, User).save(user);
    }

    async verifyDeveloperAccount(
        ctx: RequestContext,
        verificationToken: string,
    ): Promise<User | VerificationTokenInvalidError | VerificationTokenExpiredError> {
        const user = await this.databaseService
            .getRepository(ctx, User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.authenticationMethods', 'authMethods')
            .leftJoin('user.authenticationMethods', 'authenticationMethod')
            .where('authenticationMethod.verificationToken = :verificationToken', { verificationToken })
            .getOne();

        if (!user) {
            return new VerificationTokenInvalidError();
        } else {
            const isValid = await this.verificationTokenGenerator.verifyVerificationToken(
                ctx,
                verificationToken,
            );
            if (!isValid) {
                return new VerificationTokenExpiredError();
            } else {
                const nativeMethod = user.getNativeAuthenticationMethod();
                nativeMethod.verificationToken = null;
                user.isVerified = true;
                await this.databaseService.getRepository(ctx, NativeAuthenticationMethod).save(nativeMethod);
                return this.databaseService.getRepository(ctx, User).save(user);
            }
        }
    }

    async generateAndSetPasswordResetToken(
        ctx: RequestContext,
        emailAddress: string,
    ): Promise<User | undefined> {
        const user = await this.getUserByIdentifier(ctx, emailAddress);
        if (!user) return undefined;
        const nativeAuthMethod = user.getNativeAuthenticationMethod({ throwError: false });
        if (!nativeAuthMethod) return undefined;
        nativeAuthMethod.passwordResetToken =
            await this.verificationTokenGenerator.generateVerificationToken(ctx);
        await this.databaseService.getRepository(ctx, NativeAuthenticationMethod).save(nativeAuthMethod);
        return user;
    }

    async resetAccountPassword(
        ctx: RequestContext,
        passwordResetToken: string,
        newPassword: string,
    ): Promise<
        User | PasswordResetTokenInvalidError | PasswordResetTokenExpiredError | PasswordValidationError
    > {
        const user = await this.databaseService
            .getRepository(ctx, User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.authenticationMethods', 'authMethods')
            .leftJoin('user.authenticationMethods', 'authenticationMethod')
            .addSelect('authMethods.password')
            .where('authenticationMethod.passwordResetToken = :passwordResetToken', { passwordResetToken })
            .getOne();

        if (!user) {
            return new PasswordResetTokenInvalidError();
        } else {
            const passwordValidationResult = await this.validatePassword(ctx, newPassword);
            if (passwordValidationResult !== true) {
                return passwordValidationResult;
            }
            const isValid = await this.verificationTokenGenerator.verifyVerificationToken(
                ctx,
                passwordResetToken,
            );
            if (!isValid) {
                return new PasswordResetTokenExpiredError();
            } else {
                const nativeMethod = user.getNativeAuthenticationMethod();
                nativeMethod.password = await this.passwordHashingService.hash(newPassword);
                nativeMethod.passwordResetToken = null;
                // completing password-reset workflow proves ownership of the email address to which the token was delivered
                nativeMethod.verificationToken = null;
                await this.databaseService.getRepository(ctx, NativeAuthenticationMethod).save(nativeMethod);
                if (!user.isVerified && this.configService.authOptions.requireVerification) {
                    // completing password-reset workflow proves ownership of the email address to which the token was delivered
                    // so the flow makes the same guarantees made by the verification workflow therefore no need for account verification.
                    user.isVerified = true;
                }
                return this.databaseService.getRepository(ctx, User).save(user);
            }
        }
    }

    async generateAndSetIdentifierChangeToken(ctx: RequestContext, user: User): Promise<User | undefined> {
        const nativeAuthMethod = user.getNativeAuthenticationMethod();
        nativeAuthMethod.identifierChangeToken =
            await this.verificationTokenGenerator.generateVerificationToken(ctx);
        await this.databaseService.getRepository(ctx, NativeAuthenticationMethod).save(nativeAuthMethod);
        return user;
    }

    async changeIdentifier(
        ctx: RequestContext,
        identifierChangeToken: string,
    ): Promise<
        | IdentifierChangeTokenInvalidError
        | IdentifierChangeTokenExpiredError
        | { user: User; oldIdentifier: string }
    > {
        const user = await this.databaseService
            .getRepository(ctx, User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.authenticationMethods', 'authMethods')
            .leftJoin('user.authenticationMethods', 'authenticationMethod')
            .addSelect('authMethods.password')
            .where('authenticationMethod.identifierChangeToken = :identifierChangeToken', {
                identifierChangeToken,
            })
            .getOne();

        if (!user) {
            return new IdentifierChangeTokenInvalidError();
        } else {
            const isValid = await this.verificationTokenGenerator.verifyVerificationToken(
                ctx,
                identifierChangeToken,
            );
            if (!isValid) {
                return new IdentifierChangeTokenExpiredError();
            } else {
                const nativeMethod = user.getNativeAuthenticationMethod();
                const identifierPlaceholder = nativeMethod.identifierPlaceholder;
                if (!identifierPlaceholder) {
                    throw new InternalServerError('errors.identifier_placeholder_missing');
                }

                const oldIdentifier = user.identifier;
                user.identifier = identifierPlaceholder;
                nativeMethod.identifier = identifierPlaceholder;
                nativeMethod.identifierChangeToken = null;
                nativeMethod.identifierPlaceholder = null;

                await this.databaseService.getRepository(ctx, NativeAuthenticationMethod).save(nativeMethod);
                await this.databaseService.getRepository(ctx, User).save(user);
                return { user, oldIdentifier };
            }
        }
    }

    public async updatePassword(
        ctx: RequestContext,
        input: { currentPassword: string; newPassword: string; userId: string },
    ): Promise<InvalidCredentialsError | PasswordValidationError | boolean> {
        const user = await this.databaseService
            .getRepository(ctx, User)
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.authenticationMethods', 'authMethods')
            .addSelect('authMethods.password')
            .where('user.id = :id', { id: input.userId })
            .getOne();

        if (!user) {
            throw new EntityNotFoundError({ entityId: input.userId, entityName: 'User' });
        }

        const passwordValidationResult = await this.validatePassword(ctx, input.newPassword);
        if (passwordValidationResult !== true) {
            return passwordValidationResult;
        }

        const nativeMethod = user.getNativeAuthenticationMethod();
        const matches = await this.passwordHashingService.verify(
            input.currentPassword,
            nativeMethod.password,
        );
        if (!matches) {
            return new InvalidCredentialsError({ reason: '' });
        }

        nativeMethod.password = await this.passwordHashingService.hash(input.newPassword);

        await this.databaseService
            .getRepository(ctx, NativeAuthenticationMethod)
            .save(nativeMethod, { reload: false });
        return true;
    }

    /**
     * @description
     * Creates a new admin user with credentials authentication.
     */
    public async createAdminUser(
        ctx: RequestContext,
        credentials: {
            identifier: string;
            plainPassword: string;
        },
    ) {
        const normalizedInput = normalizeInput(credentials.identifier);
        const user = new User({
            identifier: normalizedInput,
            isVerified: true,
        });
        const credentialsAuthMethod = new NativeAuthenticationMethod({
            identifier: normalizedInput,
            password: await this.passwordHashingService.hash(credentials.plainPassword),
        });
        await this.databaseService.getRepository(ctx, NativeAuthenticationMethod).save(credentialsAuthMethod);
        user.authenticationMethods = [credentialsAuthMethod];
        return await this.databaseService.getRepository(ctx, User).save(user);
    }

    public async createDeveloperUser(
        ctx: RequestContext,
        credentials: {
            password?: string;
            identifier: string;
        },
    ): Promise<User | PasswordValidationError> {
        const user = new User();
        user.identifier = normalizeInput(credentials.identifier);
        const customerRole = await this.roleService.getDeveloperRole(ctx);
        user.roles = [customerRole];
        const assignCredentialsAuthMethodResult = await this.assignCredentialsAuthMethodToUser(
            ctx,
            user,
            credentials,
        );
        if (isApiError(assignCredentialsAuthMethodResult)) return assignCredentialsAuthMethodResult;
        return await this.databaseService.getRepository(ctx, User).save(assignCredentialsAuthMethodResult);
    }

    public async assignCredentialsAuthMethodToUser(
        ctx: RequestContext,
        user: User,
        credentials: {
            password?: string;
            identifier: string;
        },
    ): Promise<User | PasswordValidationError> {
        if (user?.id) {
            const foundUser = await this.getUserById(ctx, user.id);
            if (foundUser && this.hasCredentialsAuthMethod(foundUser)) return foundUser;
        }

        const credentialsAuthMethod = new NativeAuthenticationMethod();
        if (this.configService.authOptions.requireVerification) {
            credentialsAuthMethod.verificationToken =
                await this.verificationTokenGenerator.generateVerificationToken(ctx);
            user.isVerified = false;
        } else {
            user.isVerified = true;
        }

        if (credentials.password) {
            const passwordValidationResult = await this.validatePassword(ctx, credentials.password);
            if (passwordValidationResult !== true) {
                return passwordValidationResult;
            }
            credentialsAuthMethod.password = await this.passwordHashingService.hash(credentials.password);
        } else {
            credentialsAuthMethod.password = '';
        }
        credentialsAuthMethod.identifier = normalizeInput(credentials.identifier);
        credentialsAuthMethod.user = user;
        await this.databaseService.getRepository(ctx, NativeAuthenticationMethod).save(credentialsAuthMethod);
        user.authenticationMethods = [...(user.authenticationMethods ?? []), credentialsAuthMethod];
        return user;
    }

    public async generateAndAssignVerificationToken(ctx: RequestContext, user: User): Promise<User> {
        const credentialsAuthMethod = user.getNativeAuthenticationMethod();
        credentialsAuthMethod.verificationToken =
            await this.verificationTokenGenerator.generateVerificationToken(ctx);
        user.isVerified = false;
        await this.databaseService.getRepository(ctx, NativeAuthenticationMethod).save(credentialsAuthMethod);
        return this.databaseService.getRepository(ctx, User).save(user);
    }

    public async softDelete(ctx: RequestContext, id: string): Promise<void> {
        // SessionService is imported dynamically to avoid circular dependency
        // since SessionService depends on UserService
        const { SessionService } = await import('./session.service.js');
        const sessionService =
            moduleRef.getProvider<import('./session.service').SessionService>(SessionService);
        await sessionService.deleteSessionsByUser(ctx, new User({ id }));

        const user = await this.getUserById(ctx, id, { roles: false, authenticationMethods: false });
        if (!user) {
            throw new EntityNotFoundError({ entityName: 'User', entityId: id });
        }
        const repo = this.databaseService.getRepository(ctx, User);

        await repo.update({ id }, { deletedAt: new Date() });
    }

    public hasCredentialsAuthMethod(user: User): boolean {
        return !!user?.authenticationMethods.find(m => m instanceof NativeAuthenticationMethod);
    }

    public async validatePassword(
        ctx: RequestContext,
        plainPassword: string,
    ): Promise<true | PasswordValidationError> {
        const result = await this.passwordValidationService.validate(ctx, plainPassword);
        if (result !== true) {
            const message = typeof result === 'string' ? result : 'Invalid password';
            return new PasswordValidationError({ validationErrorMessage: message });
        } else {
            return true;
        }
    }
}
