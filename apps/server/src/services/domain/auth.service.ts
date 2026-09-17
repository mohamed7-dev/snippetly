import { RequestContext } from '../../api/request-context/request-context';
import { ApiType } from '../../api/utils/get-api-type';
import { InternalServerError } from '../../common/errors/errors';
import {
    InvalidCredentialsError,
    NotVerifiedAccountError,
} from '../../common/errors/generated-developer-errors';
import { ConfigService } from '../../config';
import { AuthenticationStrategy } from '../../config/auth/authentication-strategy.interface';
import {
    NATIVE_AUTH_STRATEGY_NAME,
    NativeAuthenticationStrategy,
} from '../../config/auth/native-auth.strategy';
import { ExternalAuthenticationMethod } from '../../entities/authentication-method/authentication-method.entity';
import { Session } from '../../entities/session/session.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { SessionService } from './session.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly databaseService: DatabaseService,
        private readonly sessionService: SessionService,
    ) {}

    public async authenticate(
        ctx: RequestContext,
        authStrategyName: string,
        authData: any,
        apiType: ApiType,
    ): Promise<Session | InvalidCredentialsError | NotVerifiedAccountError> {
        const authStrategy = this.getAuthStrategy(apiType, authStrategyName);
        const result = await authStrategy.authenticate(ctx, authData);
        if (typeof result === 'string') {
            return new InvalidCredentialsError({ reason: result });
        } else if (!result) {
            return new InvalidCredentialsError({ reason: '' });
        }
        return await this.openAuthenticatedSession(ctx, result, authStrategy.name);
    }

    /**
     * @description
     * Opens an authenticated session for a user after successful authentication.
     * Performs verification checks, updates user data, and creates the session.
     */
    public async openAuthenticatedSession(
        ctx: RequestContext,
        user: User,
        authStrategyName: string,
    ): Promise<Session | NotVerifiedAccountError> {
        // roles needed in later steps so we need to make sure that they exist
        if (!user.roles) {
            const extendedUser = await this.databaseService.getRepository(ctx, User).findOne({
                relations: { roles: true },
                where: {
                    id: user.id,
                },
            });
            user.roles = extendedUser?.roles || [];
        }

        const providerAuthMethods = (user.authenticationMethods ?? []).filter(
            am => am instanceof ExternalAuthenticationMethod,
        );
        if (
            !providerAuthMethods.length &&
            this.configService.authOptions.requireVerification &&
            !user.isVerified
        ) {
            return new NotVerifiedAccountError();
        }
        user.lastAuthenticatedAt = new Date();
        await this.databaseService.getRepository(ctx, User).save(user);
        return await this.sessionService.createSession(ctx, user, authStrategyName);
    }

    public async endSession(ctx: RequestContext, sessionToken: string): Promise<void> {
        const session = await this.databaseService.getRepository(ctx, Session).findOne({
            relations: ['user', 'user.authenticationMethods'],
            where: {
                token: sessionToken,
            },
        });

        if (session) {
            const sessionAuthStrategy = this.getAuthStrategy(ctx.apiType, session.authenticationStrategy);
            await sessionAuthStrategy.onLogout?.(ctx, session.user);
            await this.sessionService.deleteSessionsByUser(ctx, session.user);
        }
    }

    public async verifyUserPassword(
        ctx: RequestContext,
        userId: string,
        password: string,
    ): Promise<boolean | InvalidCredentialsError> {
        const nativeAuthenticationStrategy = this.getAuthStrategy('developer', NATIVE_AUTH_STRATEGY_NAME);
        const passwordMatches = await nativeAuthenticationStrategy.verifyUserPassword(ctx, userId, password);
        if (!passwordMatches) {
            return new InvalidCredentialsError({ reason: '' });
        }
        return true;
    }

    private getAuthStrategy(
        apiType: ApiType,
        method: typeof NATIVE_AUTH_STRATEGY_NAME,
    ): NativeAuthenticationStrategy;
    private getAuthStrategy(apiType: ApiType, method: string): AuthenticationStrategy;
    private getAuthStrategy(apiType: ApiType, authStrategyName: string): AuthenticationStrategy {
        const { adminAuthenticationStrategies, developerAuthenticationStrategies } =
            this.configService.authOptions;
        const authStrategies =
            apiType === 'admin' ? adminAuthenticationStrategies : developerAuthenticationStrategies;
        const foundStrategy = authStrategies.find(s => s.name === authStrategyName);
        if (!foundStrategy) {
            throw new InternalServerError('errors.authentication_strategy_not_found', {
                name: authStrategyName,
            });
        }
        return foundStrategy;
    }
}
