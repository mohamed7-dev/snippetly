import { PasswordValidationError } from '@snippetly/common/errors';
import { RequestContext } from '../../api/request-context/request-context';
import { isApiError } from '../../common/errors/api-error';
import { isEmailAddressLike, normalizeInput } from '../../common/helpers/validation';
import { ConfigService } from '../../config/config.service';
import { CredentialsAuthenticationMethod } from '../../entities/authentication-method/authentication-method.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
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

    public async getUserById(ctx: RequestContext, userId: string): Promise<User | undefined> {
        const foundUser = await this.databaseService.getRepository(ctx, User).findOne({
            where: {
                id: userId,
            },
            relations: {
                roles: true,
                authenticationMethods: true,
            },
        });

        return foundUser ?? undefined;
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
        const credentialsAuthMethod = new CredentialsAuthenticationMethod({
            identifier: normalizedInput,
            password: await this.passwordHashingService.hash(credentials.plainPassword),
        });
        await this.databaseService
            .getRepository(ctx, CredentialsAuthenticationMethod)
            .save(credentialsAuthMethod);
        user.authenticationMethods = [credentialsAuthMethod];
        return await this.databaseService.getRepository(ctx, User).save(user);
    }

    public async createDeveloperUser(
        ctx: RequestContext,
        credentials: {
            password: string;
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
            password: string;
            identifier: string;
        },
    ): Promise<User | PasswordValidationError> {
        if (user?.id) {
            const foundUser = await this.getUserById(ctx, user.id);
            if (foundUser && this.hasCredentialsAuthMethod(foundUser)) return foundUser;
        }

        const credentialsAuthMethod = new CredentialsAuthenticationMethod();
        if (this.configService.authOptions.requireVerification) {
            credentialsAuthMethod.verificationToken =
                await this.verificationTokenGenerator.generateVerificationToken(ctx);
            user.isVerified = false;
        } else {
            user.isVerified = true;
        }

        const passwordValidationResult = await this.validatePassword(ctx, credentials.password);
        if (passwordValidationResult !== true) {
            return passwordValidationResult;
        }
        credentialsAuthMethod.password = await this.passwordHashingService.hash(credentials.password);
        credentialsAuthMethod.identifier = normalizeInput(credentials.identifier);
        credentialsAuthMethod.user = user;
        await this.databaseService
            .getRepository(ctx, CredentialsAuthenticationMethod)
            .save(credentialsAuthMethod);
        user.authenticationMethods = [...(user.authenticationMethods ?? []), credentialsAuthMethod];
        return user;
    }

    public async generateAndAssignVerificationToken(ctx: RequestContext, user: User): Promise<User> {
        const credentialsAuthMethod = user.getCredentialsAuthMethod();
        credentialsAuthMethod.verificationToken =
            await this.verificationTokenGenerator.generateVerificationToken(ctx);
        user.isVerified = false;
        await this.databaseService
            .getRepository(ctx, CredentialsAuthenticationMethod)
            .save(credentialsAuthMethod);
        return this.databaseService.getRepository(ctx, User).save(user);
    }

    public hasCredentialsAuthMethod(user: User): boolean {
        return !!user?.authenticationMethods.find(m => m instanceof CredentialsAuthenticationMethod);
    }

    private async validatePassword(
        ctx: RequestContext,
        plainPassword: string,
    ): Promise<true | PasswordValidationError> {
        const result = await this.passwordValidationService.validate(ctx, plainPassword);
        if (result !== true) {
            const message = typeof result === 'string' ? result : 'Invalid password';
            return new PasswordValidationError(message);
        } else {
            return true;
        }
    }
}
