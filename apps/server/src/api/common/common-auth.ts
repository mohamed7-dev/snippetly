import {
    AuthenticateDeveloperDtoType,
    authenticatedUserDto,
    AuthenticatedUserDto,
    SuccessResponseDtoType,
} from '@snippetly/common/dto';
import {
    InternalServerError,
    InvalidCredentialsError,
    NotVerifiedAccountError,
} from '@snippetly/common/errors';
import { Request, Response } from 'express';
import { isApiError } from '../../common/errors/api-error';
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
        input: AuthenticateDeveloperDtoType['body'],
        req: Request,
        res: Response,
    ): Promise<AuthenticatedUserDto | NotVerifiedAccountError | InvalidCredentialsError> {
        const authInfo = Object.entries(input)[0];
        const sessionResult = await this.authService.authenticate(
            ctx,
            authInfo?.[0] as string,
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

    public async sharedLogout(
        ctx: RequestContext,
        req: Request,
        res: Response,
    ): Promise<SuccessResponseDtoType> {
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

    protected clientSafeUser(user: User): AuthenticatedUserDto {
        const parsedData = authenticatedUserDto.safeParse(user);
        if (parsedData.error) throw new InternalServerError('errors.invalid-user-data');
        return parsedData.data;
    }
}
