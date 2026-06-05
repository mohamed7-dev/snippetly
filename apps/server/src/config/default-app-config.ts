import { LanguageCode } from '@snippetly/common/dto';
import {
    DEFAULT_ADMIN_API_PATH_PREFIX,
    DEFAULT_DEVELOPER_API_PATH_PREFIX,
    SUPER_ADMIN_IDENTIFIER,
    SUPER_ADMIN_PASSWORD,
} from '@snippetly/common/lib';
import { RuntimeAppConfig } from './app-config.interface';
import { BcryptPasswordHashingStrategy } from './auth/bcrypt-hashing.strategy';
import { CredentialsAuthenticationStrategy } from './auth/credentials-auth.strategy';
import { DefaultPasswordValidationStrategy } from './auth/default-password-validation.strategy';
import { DefaultSessionCacheStrategy } from './auth/default-session-cache.strategy';
import { DefaultVerificationTokenStrategy } from './auth/default-verification-token.strategy';
import { UploadthingStrategy } from './system/binary-storage/uploadthing.strategy';
import { InMemoryCacheStrategy } from './system/cache/in-memory-cache.strategy';
import { NodemailerStrategy } from './system/email/nodemailer.strategy';
import { StdoutLoggerStrategy } from './system/logger/stdout-logger.strategy';

export const defaultAppConfig: RuntimeAppConfig = {
    defaultLanguageCode: LanguageCode.English,
    api: {
        host: 'localhost',
        port: 3000,
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
    },
    system: {
        emailTransporterStrategy: new NodemailerStrategy({ email: '', password: '' }),
        loggerStrategy: new StdoutLoggerStrategy(),
        binaryStorageStrategy: new UploadthingStrategy({ token: '' }),
        cacheStrategy: new InMemoryCacheStrategy(),
    },
    auth: {
        requireVerification: true,
        verificationTokenDuration: '7d',
        sessionDuration: '1y',
        sessionCacheTTL: 300,
        superAdminCredentials: {
            identifier: SUPER_ADMIN_IDENTIFIER,
            password: SUPER_ADMIN_PASSWORD,
        },
        sessionCacheStrategy: new DefaultSessionCacheStrategy(),
        passwordValidationStrategy: new DefaultPasswordValidationStrategy(),
        passwordHashingStrategy: new BcryptPasswordHashingStrategy(),
        verificationTokenStrategy: new DefaultVerificationTokenStrategy(),
        adminAuthenticationStrategies: [new CredentialsAuthenticationStrategy()],
        developerAuthenticationStrategies: [new CredentialsAuthenticationStrategy()],
    },
};
