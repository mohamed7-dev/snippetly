import { LanguageCode } from '@snippetly/common/dto';
import { CorsOptions } from 'cors';
import { DataSourceOptions } from 'typeorm';
import { AuthenticationStrategy } from './auth/authentication-strategy.interface';
import { PasswordHashingStrategy } from './auth/password-hashing-strategy.interface';
import { PasswordValidationStrategy } from './auth/password-validation-strategy.interface';
import { SessionCacheStrategy } from './auth/session-cache-strategy.interface';
import { VerificationTokenStrategy } from './auth/verification-token-strategy.interface';
import { BinaryStorageStrategy } from './system/binary-storage/binary-storage-strategy.interface';
import { CacheStrategy } from './system/cache/cache-strategy.interface';
import { EmailTransporterStrategy } from './system/email/email-transporter-strategy.interface';
import { LoggerStrategy } from './system/logger/logger-strategy.interface';

interface ApiActorOptions {
    path?: string;
    listingLimit?: number;
}

export interface ApiConfigOptions {
    host?: string;
    port?: number;
    admin?: ApiActorOptions;
    developer?: ApiActorOptions;
    cors?: CorsOptions;
}

export type DatabaseConfigOptions = DataSourceOptions;

export interface SystemConfigOptions {
    emailTransporterStrategy?: EmailTransporterStrategy;
    loggerStrategy?: LoggerStrategy;
    binaryStorageStrategy?: BinaryStorageStrategy;
    cacheStrategy?: CacheStrategy;
}

export interface AuthConfigOptions {
    requireVerification?: boolean;
    /**
     * @description
     * The duration for which a verification token is valid
     *
     * @remarks
     * - If number, it is treated as milliseconds
     * - If string, it is treated as a duration string (e.g. "1h", "2d") compatible with `ms` package.
     *
     * @default '7d'
     */
    verificationTokenDuration?: number | string;
    /**
     * @description
     * The time from the last authentication a session is valid for after which the user must re-authenticate
     *
     * @remarks
     * - If number, it is treated as milliseconds
     * - If string, it is treated as a duration string (e.g. "1h", "2d") compatible with `ms` package.
     *
     * @default '1y'
     */
    sessionDuration?: number | string;
    /**
     * @description
     * The time a session is cached in the cache before it is considered stale
     *
     * @remarks
     * - If number, it is treated as milliseconds
     * - If string, it is treated as a duration string (e.g. "1h", "2d") compatible with `ms` package.
     *
     * @default 300
     */
    sessionCacheTTL?: number | string;
    superAdminCredentials?: {
        identifier?: string;
        password?: string;
    };
    sessionCacheStrategy?: SessionCacheStrategy;
    passwordValidationStrategy?: PasswordValidationStrategy;
    passwordHashingStrategy?: PasswordHashingStrategy;
    verificationTokenStrategy?: VerificationTokenStrategy;
    adminAuthenticationStrategies?: AuthenticationStrategy[];
    developerAuthenticationStrategies?: AuthenticationStrategy[];
}

export interface AppConfig {
    defaultLanguageCode?: LanguageCode;
    api?: ApiConfigOptions;
    database?: DatabaseConfigOptions;
    system?: SystemConfigOptions;
    auth?: AuthConfigOptions;
}

/**
 * @description
 * This interface represents the AppConfig at runtime.
 * It exists after merging default configurations with ones provided by the external env.
 */
export interface RuntimeAppConfig extends Required<AppConfig> {
    api: Required<ApiConfigOptions> & {
        admin: Required<ApiActorOptions>;
        developer: Required<ApiActorOptions>;
    };
    auth: Required<AuthConfigOptions> & {
        superAdminCredentials: Required<AuthConfigOptions['superAdminCredentials']>;
    };
    system: Required<SystemConfigOptions>;
}

export type PartialAppConfig = Partial<AppConfig>;
