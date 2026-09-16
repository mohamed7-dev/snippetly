import {
    AuthenticateDeveloperDtoType,
    authenticatedUser,
    AuthenticatedUser,
    SuccessResponse,
} from '@snippetly/common/dto';
import { Request, Response } from 'express';
import { isApiError } from '../../common/errors/api-error';
import { InternalServerError } from '../../common/errors/errors';
import {
    InvalidCredentialsError,
    NotVerifiedAccountError,
} from '../../common/errors/generated-developer-errors';
import { User } from '../../entities/users/user.entity';
import { AdministratorService } from '../../services/domain/administrator.service';
import { AuthService } from '../../services/domain/auth.service';
import { RequestContext } from '../request-context/request-context';
import { getSessionToken, setSessionToken } from '../utils/session-utils';

export class CommonAuth {
    constructor(
        protected readonly authService: AuthService,
        protected readonly administratorService: AdministratorService,
    ) {}

    public async sharedAuthenticate(
        ctx: RequestContext,
        input: AuthenticateDeveloperDtoType['input'],
        req: Request,
        res: Response,
    ): Promise<AuthenticatedUser | InvalidCredentialsError | NotVerifiedAccountError> {
        const authInfo = Object.entries(input)[0];
        const sessionResult = await this.authService.authenticate(
            ctx,
            authInfo?.[0],
            authInfo?.[1],
            ctx.apiType,
        );
        if (isApiError(sessionResult)) return sessionResult;
        if (ctx.apiType === 'admin') {
            const foundAdmin = await this.administratorService.findOneByUserId(ctx, sessionResult.user.id);
            if (!foundAdmin) return new InvalidCredentialsError({ reason: '' });
        }
        setSessionToken({
            res,
            req,
            rememberMe: (authInfo?.[1] as any)?.rememberMe || false,
            sessionToken: sessionResult.token,
        });
        return this.clientSafeUser(sessionResult.user);
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
        });
        return { success: true };
    }

    protected clientSafeUser(user: User): AuthenticatedUser {
        const parsedData = authenticatedUser.safeParse(user);
        if (parsedData.error) throw new InternalServerError('errors.invalid-user-data');
        return parsedData.data;
    }
}
