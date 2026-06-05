import { Request, Response } from 'express';

interface SetSessionTokenOptions {
    sessionToken: string;
    rememberMe: boolean;
    res: Response;
    req: Request;
}

export function setSessionToken(options: SetSessionTokenOptions): void {
    const { sessionToken, rememberMe, res, req } = options;
    const year = 365 * 24 * 60 * 60 * 1000;
    // const day = 24 * 60 * 60 * 1000;

    if (req.session) {
        if (rememberMe) {
            req.sessionOptions.maxAge = year;
        }
        req.session.token = sessionToken;
    }
}

export function getSessionToken(req: Request): string | undefined {
    if (req.session && req.session.token) {
        return req.session.token;
    }
    return undefined;
}
