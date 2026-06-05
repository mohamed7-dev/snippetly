import { RegisterDeveloperAccountDtoType, SuccessResponseDtoType } from '@snippetly/common/dto';
import {
    EmailAddressConflictError,
    MissingPasswordError,
    PasswordValidationError,
} from '@snippetly/common/errors';
import { RequestContext } from '../../api/request-context/request-context';
import { isApiError } from '../../common/errors/api-error';
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
        input: RegisterDeveloperAccountDtoType['body'],
    ): Promise<
        SuccessResponseDtoType | EmailAddressConflictError | PasswordValidationError | MissingPasswordError
    > {
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

        // if (!user.isVerified) {
        //     await this.eventBus.publish(new AccountRegistrationEvent(ctx, user));
        // }

        return {
            success: true,
        };
    }
}
