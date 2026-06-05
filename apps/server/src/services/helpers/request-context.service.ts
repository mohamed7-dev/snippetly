import { Permission } from '@snippetly/common/dto';
import { LANGUAGE_CODE_QUERY_NAME } from '@snippetly/common/lib';
import { Request } from 'express';
import ms from 'ms';
import { RequestContext } from '../../api/request-context/request-context';
import { ApiType, getApiType } from '../../api/utils/get-api-type';
import { getUserPermissions } from '../../api/utils/get-user-permissions';
import { arraysIntersect } from '../../common/helpers/array-intersect';
import { SessionCacheEntry } from '../../config/auth/session-cache-strategy.interface';
import { ConfigService } from '../../config/config.service';
import { User } from '../../entities/users/user.entity';
import { Injectable } from '../../infra/ioc-container/injectable.decorator';

@Injectable()
export class RequestContextService {
    constructor(private readonly configService: ConfigService) {}

    public async create(config: { req?: Request; apiType: ApiType; languageCode?: string; user?: User }) {
        const { req, languageCode, user, apiType } = config;
        let session: SessionCacheEntry | undefined;
        if (user) {
            const permissions = user.roles ? getUserPermissions(user) : [];
            session = {
                user: {
                    id: user.id,
                    identifier: user.identifier,
                    isVerified: user.isVerified,
                    permissions,
                },
                id: '__dummy_session_id',
                token: '__dummy_session_token__',
                sessionExpiry: new Date(Date.now() + ms('1y')),
                cacheExpiry: ms('1y'),
            };
        }
        return new RequestContext({
            req,
            apiType,
            languageCode,
            isAuthorized: true,
            isAuthorizedAsOwnerOnly: false,
            session,
        });
    }

    /**
     * @description
     * Builds a RequestContext from an incoming HTTP request.
     */
    public async buildFromRequest(options: {
        req: Request;
        session?: SessionCacheEntry;
        requiredPermissions?: Permission[];
    }) {
        const { req, requiredPermissions, session } = options;
        const t = req.t;
        const languageCode = this.getLanguageCode(req);
        const apiType = getApiType(req);
        const isAuthorized = this.userHasRequiredPermissions(requiredPermissions, session?.user);
        const isOwner =
            !!requiredPermissions && requiredPermissions.includes(Permission.Owner) && !isAuthorized;
        return new RequestContext({
            req,
            apiType,
            isAuthorized,
            isAuthorizedAsOwnerOnly: isOwner,
            t,
            languageCode,
            session,
        });
    }

    private getLanguageCode(req: Request): string | undefined {
        // priorities ->
        //  1. request query
        //  3. config language
        const queryLocaleCode = req.query && (req.query[LANGUAGE_CODE_QUERY_NAME] as string);
        return queryLocaleCode ?? this.configService.defaultLanguageCode;
    }

    private userHasRequiredPermissions(requiredPermissions: string[] = [], user: SessionCacheEntry['user']) {
        if (!user) return false;
        const userPermissions = user?.permissions;
        if (userPermissions) {
            // match userPermissions with the permissions
            return arraysIntersect(userPermissions, requiredPermissions);
        }
        return false;
    }
}
