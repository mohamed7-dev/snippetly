import { OAuth2Client } from 'google-auth-library';
import { RequestContext } from '../../api/request-context/request-context';
import { User } from '../../entities/users/user.entity';
import { ModuleRef } from '../../infra/ioc-container/module-ref';
import { Logger } from '../../infra/logger/logger';
import { ExternalAuthService } from '../../services/helpers/external-auth.service';
import { AuthenticationStrategy } from './authentication-strategy.interface';

const contextName = 'GoogleAuthStrategy';

export interface GoogleAuthData {
    token: string;
}

export interface GoogleAuthOptions {
    googleClientId: string;
    onUserCreated?: (ctx: RequestContext, moduleRef: ModuleRef, user: User) => void;
    onUserFound?: (ctx: RequestContext, moduleRef: ModuleRef, user: User) => void;
}

export class GoogleAuthenticationStrategy implements AuthenticationStrategy<GoogleAuthData> {
    readonly name = 'google';
    private client: OAuth2Client;
    private externalAuthenticationService: ExternalAuthService;
    private moduleRef: ModuleRef;

    constructor(private options: GoogleAuthOptions) {
        // Initialize Google OAuth2Client for token verification
        this.client = new OAuth2Client(options.googleClientId);
    }

    defineZodSchemaSource(): string {
        return `
            z.object({
                token: z.string().nonempty(),
            })
        `;
    }

    onInit(moduleRef: ModuleRef): void | Promise<void> {
        this.externalAuthenticationService = moduleRef.getProvider(ExternalAuthService);
    }

    async authenticate(ctx: any, data: GoogleAuthData): Promise<User | string | false> {
        try {
            // 1. verify the google token
            const ticket = await this.client.verifyIdToken({
                idToken: data.token,
                audience: this.options.googleClientId,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                Logger.error('Invalid Google token or missing email', contextName);
                return false;
            }
            // 2. find developer user on snippetly
            const foundUser = await this.externalAuthenticationService.findDeveloperUser(
                ctx,
                this.name,
                payload.sub, // Google's unique user ID
            );

            if (foundUser) {
                // User exists, log them in
                Logger.verbose(`User found: ${foundUser.identifier}`, contextName);
                this.options.onUserFound?.(ctx, this.moduleRef, foundUser);
                return foundUser;
            }
            // 3. create a new developer account
            const createdUser = await this.externalAuthenticationService.createUserAndDeveloper(ctx, {
                strategyName: this.name,
                identifier: payload.sub, // Store Google user ID
                isVerified: payload.email_verified || false, // Use Google's verification status
                emailAddress: payload.email,
                firstName: payload.given_name || 'Google',
                lastName: payload.family_name || 'User',
            });

            this.options.onUserCreated?.(ctx, this.moduleRef, createdUser);

            return createdUser;
        } catch (error) {
            Logger.error(`Google authentication failed: ${(error as Error).message}`, contextName);
            return false;
        }
    }
}
