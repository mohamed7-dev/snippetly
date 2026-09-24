import { Permission } from '@snippetly/common/dto';
import { Handler, NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../../common/errors/errors';
import { AuthConfigOptions } from '../../config/app-config.interface';
import { SessionCacheEntry } from '../../config/auth/session-cache-strategy.interface';
import { ConfigService } from '../../config/config.service';
import { moduleRef } from '../../infra/ioc-container/module-ref';
import { SessionService } from '../../services/domain/session.service';
import { RequestContextService } from '../../services/helpers/request-context.service';
import { RequestContext } from '../request-context/request-context';
import { attachRequestContext } from '../request-context/utils';
import { getSessionToken, setSessionToken } from '../utils/session-utils';

interface AuthGuardOptions {
    permissions: Permission[];
}

export function authGuard(options?: AuthGuardOptions): Handler {
    return async (req: Request, res: Response, next: NextFunction) => {
        const permissions = options?.permissions;
        const isPublic = !!permissions && permissions.includes(Permission.Public);
        let requestContext: RequestContext;

        const requestContextService = moduleRef.getProvider<RequestContextService>(RequestContextService);
        const configService = moduleRef.getProvider<ConfigService>(ConfigService);
        const session = await getSession(req, res, configService.authOptions);
        // eslint-disable-next-line prefer-const
        requestContext = await requestContextService.buildFromRequest({
            req,
            requiredPermissions: permissions,
            session,
        });
        attachRequestContext(req, requestContext);

        if (isPublic || !permissions) {
            next();
        } else {
            const hasPermissions =
                requestContext.checkIfUserHasPermissions(permissions) ||
                requestContext.isAuthorizedAsOwnerOnly;
            if (hasPermissions) {
                next();
            } else {
                throw new ForbiddenError();
            }
        }
    };
}

async function getSession(
    req: Request,
    res: Response,
    authOptions: Required<AuthConfigOptions>,
): Promise<SessionCacheEntry | undefined> {
    const token = getSessionToken(req);
    let sessionCacheEntry: SessionCacheEntry | undefined;
    if (token) {
        const sessionService = moduleRef.getProvider<SessionService>(SessionService);
        sessionCacheEntry = await sessionService.getSessionByToken(token);
        if (sessionCacheEntry) return sessionCacheEntry;
        // if token exists, but not in cache, it means it's expired or invalid
        setSessionToken({ req, res, sessionToken: '', rememberMe: false, authOptions });
    }
    return sessionCacheEntry;
}
