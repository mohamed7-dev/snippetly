import {
    ChangeEmailAddressDtoType,
    RefreshVerificationTokenDtoType,
    RegisterDeveloperAccountDtoType,
    RequestEmailAddressChangeDtoType,
    RequestPasswordResetDtoType,
    ResetPasswordDtoType,
    SuccessResponse,
    VerifyAccountDtoType,
} from '@snippetly/common/dto';
import { FindOptionsRelations } from 'typeorm';
import { RequestContext } from '../../api/request-context/request-context';
import { isApiError } from '../../common/errors/api-error';
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
import { ConfigService } from '../../config';
import { Developer } from '../../entities/developer/developer.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { UserService } from './user.service';

@Injectable()
export class DeveloperService {
    constructor(
        private readonly userService: UserService,
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) {}
    public async registerAccount(
        ctx: RequestContext,
        input: RegisterDeveloperAccountDtoType['input'],
    ): Promise<SuccessResponse | MissingPasswordError | PasswordValidationError> {
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
        }
    }

    public async verifyAccount(
        ctx: RequestContext,
        input: VerifyAccountDtoType['input'],
    ): Promise<User | VerificationTokenInvalidError | VerificationTokenExpiredError> {
        const result = await this.userService.verifyDeveloperAccount(ctx, input.token);

        return result;
    }

    public async requestPasswordReset(
        ctx: RequestContext,
        input: RequestPasswordResetDtoType['input'],
    ): Promise<void> {
        await this.userService.generateAndSetPasswordResetToken(ctx, input.emailAddress);
    }

    public async resetPassword(
        ctx: RequestContext,
        input: ResetPasswordDtoType['input'],
    ): Promise<
        User | PasswordResetTokenExpiredError | PasswordResetTokenInvalidError | PasswordValidationError
    > {
        return await this.userService.resetAccountPassword(ctx, input.token, input.newPassword);
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
            return true;
        } else {
            const developer = await this.getOneByUserId(ctx, user.id);
            if (!developer) return false;
            user.identifier = normalizedEmailAddress;
            developer.emailAddress = normalizedEmailAddress;
            await this.databaseService.getRepository(ctx, User).save(user, { reload: false });
            await this.databaseService.getRepository(ctx, Developer).save(developer, { reload: false });
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

        developer.emailAddress = result.user.identifier;
        await this.databaseService.getRepository(ctx, Developer).save(developer, { reload: false });

        return true;
    }

    public async getActiveDeveloper(ctx: RequestContext): Promise<Developer | undefined> {
        if (!ctx.activeUserId) return undefined;
        const repo = this.databaseService.getRepository(ctx, Developer);

        const developer = await repo.findOne({
            where: {
                user: {
                    id: ctx.activeUserId,
                },
            },
        });

        return developer ?? undefined;
    }

    public async getOneByUserId(
        ctx: RequestContext,
        userId: string,
        relations?: FindOptionsRelations<Developer>,
    ): Promise<Developer | undefined> {
        const repo = this.databaseService.getRepository(ctx, Developer);

        const developer = await repo.findOne({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: {
                ...relations,
            },
        });

        return developer ?? undefined;
    }
}
