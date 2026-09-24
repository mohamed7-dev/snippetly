import { LanguageCode } from '@snippetly/common/dto';
import {
    API_PORT,
    AUTH_TOKEN_HEADER_KEY,
    DEFAULT_ADMIN_API_PATH_PREFIX,
    DEFAULT_DEVELOPER_API_PATH_PREFIX,
    SUPER_ADMIN_IDENTIFIER,
    SUPER_ADMIN_PASSWORD,
} from '@snippetly/common/lib';
import { entitiesMap } from '../entities/entities-map';
import { RuntimeAppConfig } from './app-config.interface';
import { BcryptPasswordHashingStrategy } from './auth/bcrypt-hashing.strategy';
import { DefaultPasswordValidationStrategy } from './auth/default-password-validation.strategy';
import { DefaultSessionCacheStrategy } from './auth/default-session-cache.strategy';
import { DefaultVerificationTokenStrategy } from './auth/default-verification-token.strategy';
import { NativeAuthenticationStrategy } from './auth/native-auth.strategy';
import { InMemoryCacheStrategy } from './system/cache/in-memory-cache.strategy';
import { NodemailerStrategy } from './system/email/nodemailer.strategy';
import { StdoutLoggerStrategy } from './system/logger/stdout-logger.strategy';

export const defaultAppConfig: RuntimeAppConfig = {
    defaultLanguageCode: LanguageCode.English,
    api: {
        trustProxy: false,
        host: 'localhost',
        port: API_PORT,
        disableRateLimiting: false,
        cors: { origin: true, credentials: true },
        admin: {
            listingLimit: 1000,
            path: DEFAULT_ADMIN_API_PATH_PREFIX,
        },
        developer: {
            listingLimit: 100,
            path: DEFAULT_DEVELOPER_API_PATH_PREFIX,
        },
    },
    database: {
        type: 'postgres',
        entities: Object.values(entitiesMap),
    },
    system: {
        shouldRunInitialization: true,
        email: {
            emailTransporterStrategy: new NodemailerStrategy({ email: '', password: '' }),
            accountVerificationCallbackUrl: '',
            passwordResetCallbackUrl: '',
            identifierChangeCallbackUrl: '',
            from: '',
        },
        loggerStrategy: new StdoutLoggerStrategy(),
        cacheStrategy: new InMemoryCacheStrategy(),
    },
    auth: {
        authTokenHeaderKey: AUTH_TOKEN_HEADER_KEY,
        requireVerification: true,
        verificationTokenDuration: '7d',
        sessionDuration: '1y',
        sessionCacheTTL: 300,
        superAdminCredentials: {
            identifier: SUPER_ADMIN_IDENTIFIER,
            password: SUPER_ADMIN_PASSWORD,
        },
        sessionCacheStrategy: new DefaultSessionCacheStrategy(),
        passwordValidationStrategy: new DefaultPasswordValidationStrategy({ minLength: 8, maxLength: 32 }),
        passwordHashingStrategy: new BcryptPasswordHashingStrategy(),
        verificationTokenStrategy: new DefaultVerificationTokenStrategy(),
        adminAuthenticationStrategies: [new NativeAuthenticationStrategy()],
        developerAuthenticationStrategies: [new NativeAuthenticationStrategy()],
    },
};
