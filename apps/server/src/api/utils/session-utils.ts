import { Request, Response } from 'express';
import { AuthConfigOptions } from '../../config/app-config.interface';

interface SetSessionTokenOptions {
    sessionToken: string;
    rememberMe: boolean;
    res: Response;
    req: Request;
    authOptions: Required<AuthConfigOptions>;
}

export function setSessionToken(options: SetSessionTokenOptions): void {
    const { sessionToken, res, authOptions } = options;
    res.set(authOptions.authTokenHeaderKey, sessionToken);
}

export function getSessionToken(req: Request): string | undefined {
    const authHeader = req.get('Authorization')?.trim();
    if (authHeader) {
        const matchesBearer = authHeader.match(/^bearer\s(.+)$/i);
        if (matchesBearer) {
            return matchesBearer[1];
        }
    }
    return undefined;
}
