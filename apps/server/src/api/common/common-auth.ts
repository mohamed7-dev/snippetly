import {
    AuthenticateAdminDtoType,
    AuthenticateDeveloperDtoType,
    authenticatedUser,
    AuthenticatedUser,
    listActiveSessionsDto,
    Permission,
    revokeSessionDto,
    SuccessResponse,
} from '@snippetly/common/dto';
import { Request, RequestHandler, Response, Router } from 'express';
import { isApiError } from '../../common/errors/api-error';
import { ForbiddenError, InternalServerError } from '../../common/errors/errors';
import {
    InvalidCredentialsError,
    NotVerifiedAccountError,
} from '../../common/errors/generated-developer-errors';
import { ConfigService } from '../../config/config.service';
import { User } from '../../entities/users/user.entity';
import { AdministratorService } from '../../services/domain/administrator.service';
import { AuthService } from '../../services/domain/auth.service';
import { SessionService } from '../../services/domain/session.service';
import { UserService } from '../../services/domain/user.service';
import { authGuard } from '../middlewares/auth.guard';
import { defineRoutePipeline } from '../middlewares/define-router-pipeline.mw';
import { transactionInterceptor } from '../middlewares/transaction.interceptor';
import { RequestContext } from '../request-context/request-context';
import { getSessionToken, setSessionToken } from '../utils/session-utils';

export class CommonAuth {
    constructor(
        protected readonly authService: AuthService,
        protected readonly administratorService: AdministratorService,
        protected readonly userService: UserService,
        protected readonly configService: ConfigService,
        protected readonly sessionService: SessionService,
    ) {}

    public async sharedAuthenticate(
        ctx: RequestContext,
        input: AuthenticateDeveloperDtoType['input'] | AuthenticateAdminDtoType['input'],
        req: Request,
        res: Response,
    ): Promise<AuthenticatedUser | InvalidCredentialsError | NotVerifiedAccountError> {
        const authInfo = Object.entries(input)[0];

        const sessionResult = await this.authService.authenticate(
            ctx,
            authInfo?.[0],
            authInfo?.[1],
            ctx.apiType,
            req.get('user-agent') ?? null,
        );

        if (isApiError(sessionResult)) return sessionResult;

        setSessionToken({
            res,
            req,
            rememberMe: (authInfo?.[1] as any)?.rememberMe || false,
            sessionToken: sessionResult.token,
            authOptions: this.configService.authOptions,
        });
        return this.clientSafeUser(sessionResult.user);
    }

    protected registerSessionManagementRoutes(router: Router, limiter: RequestHandler): void {
        router.get(
            '/sessions',
            ...defineRoutePipeline({
                before: [limiter, authGuard({ permissions: [Permission.Authenticated] })],
                response: listActiveSessionsDto.output,
                handler: async (req, res) => {
                    const ctx = req.getRequestContext();
                    const userId = ctx.activeUserId;
                    if (!userId) throw new ForbiddenError();
                    const sessions = await this.sessionService.listActiveSessions(ctx, userId);
                    return res.status(200).json(
                        sessions.map(session => ({
                            id: session.id,
                            createdAt: session.createdAt,
                            expiresAt: session.expiresAt,
                            authenticationStrategy: session.authenticationStrategy,
                            userAgent: session.userAgent,
                            isCurrent: session.id === ctx.session?.id,
                        })),
                    );
                },
            }),
        );

        router.delete(
            '/sessions/:id',
            ...defineRoutePipeline({
                before: [limiter, authGuard({ permissions: [Permission.Authenticated] })],
                params: revokeSessionDto.input,
                response: revokeSessionDto.output,
                interceptors: [transactionInterceptor()],
                handler: async (req, res) => {
                    const ctx = req.getRequestContext();
                    const userId = ctx.activeUserId;
                    if (!userId) throw new ForbiddenError();
                    const session = await this.sessionService.revokeSession(ctx, userId, req.params.id);
                    if (session.id === ctx.session?.id) {
                        setSessionToken({
                            req,
                            res,
                            sessionToken: '',
                            rememberMe: false,
                            authOptions: this.configService.authOptions,
                        });
                    }
                    return res.status(200).json({ success: true });
                },
            }),
        );
    }

    public async sharedLogout(ctx: RequestContext, req: Request, res: Response): Promise<SuccessResponse> {
        const sessionToken = getSessionToken(req);
        if (!sessionToken) return { success: false };
        await this.authService.endSession(ctx, sessionToken);
        setSessionToken({
            req,
            res,
            sessionToken: '',
            rememberMe: false,
            authOptions: this.configService.authOptions,
        });
        return { success: true };
    }

    public async me(ctx: RequestContext) {
        const userId = ctx.activeUserId;
        if (!userId) {
            throw new ForbiddenError();
        }

        const user = userId ? await this.userService.getUserById(ctx, userId) : undefined;
        return user ? this.clientSafeUser(user) : null;
    }

    protected clientSafeUser(user: User): AuthenticatedUser {
        const parsedData = authenticatedUser.safeParse(user);
        if (parsedData.error) throw new InternalServerError('errors.invalid_user_data');
        return parsedData.data;
    }
}
