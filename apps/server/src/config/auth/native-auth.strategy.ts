import { RequestContext } from '../../api/request-context/request-context';
import { NativeAuthenticationMethod } from '../../entities/authentication-method/authentication-method.entity';
import { User } from '../../entities/users/user.entity';
import { ModuleRef } from '../../infra/ioc-container/module-ref';
import { AuthenticationStrategy } from './authentication-strategy.interface';

export const NATIVE_AUTH_STRATEGY_NAME = 'native';

export interface NativeAuthenticationData {
    identifier: string;
    password: string;
}

export class NativeAuthenticationStrategy implements AuthenticationStrategy {
    private userService: import('../../services/domain/user.service').UserService;
    private developerService: import('../../services/domain/developer.service').DeveloperService;
    private passwordHashingService: import('../../services/helpers/password-hashing.service').PasswordHashingService;
    private databaseService: import('../../infra/database/database.service').DatabaseService;

    name: string = NATIVE_AUTH_STRATEGY_NAME;

    onInit?(moduleRef: ModuleRef): void {
        const { UserService } = require('../../services/domain/user.service.js');
        const { DeveloperService } = require('../../services/domain/developer.service.js');
        const { PasswordHashingService } = require('../../services/helpers/password-hashing.service.js');
        const { DatabaseService } = require('../../infra/database/database.service.js');
        this.userService = moduleRef.getProvider(UserService);
        this.developerService = moduleRef.getProvider(DeveloperService);
        this.passwordHashingService = moduleRef.getProvider(PasswordHashingService);
        this.databaseService = moduleRef.getProvider(DatabaseService);
    }

    defineZodSchemaSource(): string {
        return `
            z.object({
                identifier: z.string().nonempty(),
                password: z.string().nonempty(),
                rememberMe:z.boolean().optional(),
            })
        `;
    }

    async authenticate(ctx: RequestContext, data: NativeAuthenticationData): Promise<User | string | false> {
        const user = await this.userService.getUserByIdentifierForAuthentication(ctx, data.identifier);
        if (!user) return false;
        const passwordVerificationResult = await this.verifyUserPassword(ctx, user.id, data.password);
        if (!passwordVerificationResult) return false;

        if (ctx.apiType === 'developer' && user.deletedAt) {
            const restored = await this.developerService.restoreAccount(ctx, user.id);
            if (!restored) return false;
            user.deletedAt = null;
        }

        return user;
    }

    async verifyUserPassword(ctx: RequestContext, userId: string, plainPassword: string) {
        const user = await this.databaseService.getRepository(ctx, User).findOne({
            where: {
                id: userId,
            },
            relations: { authenticationMethods: true },
        });
        if (!user) return false;
        const credentialsAuthMethod = user.getNativeAuthenticationMethod();
        if (!credentialsAuthMethod) return false;
        const password =
            (
                await this.databaseService.getRepository(ctx, NativeAuthenticationMethod).findOne({
                    where: { id: credentialsAuthMethod.id },
                    select: ['password'],
                })
            )?.password ?? '';
        if (!password) return false;

        const isPasswordValid = await this.passwordHashingService.verify(plainPassword, password);
        return isPasswordValid;
    }
}
