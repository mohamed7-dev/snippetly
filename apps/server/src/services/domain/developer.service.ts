import {
    RefreshVerificationTokenDtoType,
    RegisterDeveloperAccountDtoType,
    SuccessResponse,
    VerifyAccountDtoType,
} from '@snippetly/common/dto';
import { RequestContext } from '../../api/request-context/request-context';
import { isApiError } from '../../common/errors/api-error';
import {
    MissingPasswordError,
    PasswordValidationError,
} from '../../common/errors/generated-developer-errors';
import { normalizeInput } from '../../common/helpers/validation';
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
    ): Promise<User | undefined> {
        const result = await this.userService.verifyDeveloperAccount(ctx, input.token);

        return result;
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
}
