import { SESSION_COOKIE_NAME } from '@snippetly/common/lib';
import baseCookieSession from 'cookie-session';
import { RequestHandler } from 'express';
import { randomBytes } from 'node:crypto';

export function cookieSession(): RequestHandler {
    return baseCookieSession({
        secret: randomBytes(16).toString('base64url'),
        httpOnly: true,
        sameSite: 'lax',
        name: SESSION_COOKIE_NAME,
    });
}
