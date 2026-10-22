import { RequestContext } from '../../api/request-context/request-context';
import { ApiType } from '../../api/utils/get-api-type';
import { InternalServerError } from '../../common/errors/errors';
import {
    InvalidCredentialsError,
    NotVerifiedAccountError,
} from '../../common/errors/generated-developer-errors';
import { AuthenticationStrategy } from '../../config/auth/authentication-strategy.interface';
import {
    NATIVE_AUTH_STRATEGY_NAME,
    NativeAuthenticationData,
    NativeAuthenticationStrategy,
} from '../../config/auth/native-auth.strategy';
import { ConfigService } from '../../config/config.service';
import { ExternalAuthenticationMethod } from '../../entities/authentication-method/authentication-method.entity';
import { Session } from '../../entities/session/session.entity';
import { User } from '../../entities/users/user.entity';
import { DatabaseService } from '../../infra/database/database.service';
import { EventBus } from '../../infra/event-bus/event-bus.service';
import { AccountRegistrationEvent } from '../../infra/event-bus/events/account-registration.eveny';
import { LoginAttemptEvent } from '../../infra/event-bus/events/login-attempt.event';
import { LoginEvent } from '../../infra/event-bus/events/login.event';
import { LogoutEvent } from '../../infra/event-bus/events/logout.event';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';
import { SessionService } from './session.service';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly databaseService: DatabaseService,
        private readonly sessionService: SessionService,
        private readonly eventBus: EventBus,
        private readonly userService: UserService,
    ) {}

    /**
     * @description
     * Checks the supplied credentials and opens a session when they are valid.
     * Returns an error for invalid credentials or accounts that still need verification.
     */
    public async authenticate(
        ctx: RequestContext,
        authStrategyName: string,
        authData: any,
        apiType: ApiType,
        userAgent: string | null = null,
    ): Promise<Session | InvalidCredentialsError | NotVerifiedAccountError> {
        await this.eventBus.publish(
            new LoginAttemptEvent(
                ctx,
                authStrategyName,
                authStrategyName === NATIVE_AUTH_STRATEGY_NAME
                    ? (authData as NativeAuthenticationData).identifier
                    : undefined,
            ),
        );
        const authStrategy = this.getAuthStrategy(apiType, authStrategyName);
        const result = await authStrategy.authenticate(ctx, authData);
        if (typeof result === 'string') {
            return new InvalidCredentialsError({ reason: result });
        } else if (!result) {
            return new InvalidCredentialsError({ reason: '' });
        }
        return await this.openAuthenticatedSession(ctx, result, authStrategy.name, userAgent);
    }

    /**
     * @description
     * Checks whether the user can sign in, then records the login and creates a session.
     * Unverified accounts that need verification are denied and sent a fresh verification token.
     */
    public async openAuthenticatedSession(
        ctx: RequestContext,
        user: User,
        authStrategyName: string,
        userAgent: string | null = null,
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

        const isUsingNativeMethod = authStrategyName === NATIVE_AUTH_STRATEGY_NAME;
        if (isUsingNativeMethod && !user.isVerified) {
            const nativeAuthMethod = user.getNativeAuthenticationMethod({ throwError: false });
            if (nativeAuthMethod && nativeAuthMethod.verificationToken != null) {
                const updatedUser = await this.userService.generateAndAssignVerificationToken(ctx, user);
                await this.eventBus.publish(new AccountRegistrationEvent(ctx, updatedUser));
                return new NotVerifiedAccountError();
            }
        }

        const providerAuthMethods = (user.authenticationMethods ?? []).filter(
            am => am instanceof ExternalAuthenticationMethod,
        );
        if (
            (!isUsingNativeMethod || !providerAuthMethods.length) &&
            this.configService.authOptions.requireVerification &&
            !user.isVerified
        ) {
            return new NotVerifiedAccountError();
        }
        user.lastAuthenticatedAt = new Date();
        await this.databaseService.getRepository(ctx, User).save(user);
        const session = await this.sessionService.createSession(ctx, user, authStrategyName, userAgent);
        await this.eventBus.publish(new LoginEvent(ctx, user));
        return session;
    }

    /**
     * @description
     * Ends the session with this token and removes the user's active sessions.
     */
    public async endSession(ctx: RequestContext, sessionToken: string): Promise<void> {
        const session = await this.databaseService.getRepository(ctx, Session).findOne({
            where: {
                token: sessionToken,
            },
            relations: {
                user: {
                    authenticationMethods: true,
                },
            },
        });

        if (session) {
            const sessionAuthStrategy = this.getAuthStrategy(ctx.apiType, session.authenticationStrategy);
            await sessionAuthStrategy.onLogout?.(ctx, session.user);
            await this.eventBus.publish(new LogoutEvent(ctx));
            await this.sessionService.deleteSessionsByUser(ctx, session.user);
        }
    }

    /**
     * @description
     * Checks a user's password and returns an error if it does not match.
     */
    public async verifyUserPassword(
        ctx: RequestContext,
        userId: string,
        password: string,
    ): Promise<boolean | InvalidCredentialsError> {
        const nativeAuthenticationStrategy = this.getAuthStrategy(ctx.apiType, NATIVE_AUTH_STRATEGY_NAME);
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
    /** Finds the configured sign-in strategy for the requested API. */
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
