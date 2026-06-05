import { Permission } from '@snippetly/common/dto';
import { Request } from 'express';
import { TFunction } from 'i18next';
import { arraysIntersect } from '../../common/helpers/array-intersect';
import { SessionCacheEntry } from '../../config/auth/session-cache-strategy.interface';
import { ApiType } from '../utils/get-api-type';

interface RequestContextOptions {
    req?: Request;
    apiType: ApiType;
    languageCode?: string;
    t?: TFunction;
    session?: SessionCacheEntry;
    isAuthorized: boolean;
    isAuthorizedAsOwnerOnly: boolean;
}
export class RequestContext {
    private _req?: Request;
    private _apiType: ApiType;
    private _languageCode: string;
    private _t: TFunction;
    private _session?: SessionCacheEntry;
    private _isAuthorized: boolean;
    private _isAuthorizedAsOwnerOnly: boolean;

    constructor(options: RequestContextOptions) {
        this._req = options.req;
        this._apiType = options.apiType;
        this._languageCode = options.languageCode ?? 'en';
        this._t = options.t ?? (((key: string) => key) as any);
        this._session = options.session;
        this._isAuthorized = options.isAuthorized;
        this._isAuthorizedAsOwnerOnly = options.isAuthorizedAsOwnerOnly;
    }

    /**
     * @description
     * Identifies the API endpoint through which the request was received
     * (e.g., admin, staff, or patient).
     */
    get apiType(): ApiType {
        return this._apiType;
    }

    /**
     * @description
     * Returns the underlying raw request object, if present.
     * This can be used for low-level access when needed.
     */
    get req(): Request | undefined {
        return this._req;
    }

    /**
     * @description
     * Indicates whether the current session is allowed to access the resolver method or not.
     */
    get isAuthorized(): boolean {
        return this._isAuthorized;
    }

    /**
     * @description
     * If True, the current anonymous session is allowed to operate only on entities that are owned by it.
     */
    get isAuthorizedAsOwnerOnly(): boolean {
        return this._isAuthorizedAsOwnerOnly;
    }

    /**
     * @description
     * Returns the language code associated with the current request.
     * This value is used to determine the language of localized responses.
     */
    get languageCode(): string {
        return this._languageCode;
    }

    /**
     * @description
     * Returns the session cache entry associated with the current request, if available.
     */
    get session(): SessionCacheEntry | undefined {
        return this._session;
    }

    /**
     * @description
     * Returns the ID of the currently authenticated user, if a session exists.
     */
    get activeUserId(): string | undefined {
        return this.session?.user?.id;
    }

    /**
     * @description
     * Resolves a localized string using the configured translation function.
     *
     * @param key - The translation key to resolve.
     * @param variables - Optional variables used for interpolation within the translation string.
     *
     * @returns The localized string. If an error occurs during formatting,
     * a fallback string is returned containing diagnostic information.
     *
     * @remarks
     * - This method is designed to be fail-safe and will never throw.
     * - If no translation function is provided, it defaults to returning the key as-is.
     */
    public t(key: string, variables?: Record<string, any>): string {
        try {
            return this._t(key, variables);
        } catch (error) {
            return `[Translation-Format-Error]: ${JSON.stringify((error as Error).message)}). Original key: ${key}`;
        }
    }

    /**
     * @description
     * Checks if the current user has one of the required permissions.
     */
    public checkIfUserHasPermissions(permissions: Permission[]) {
        const currentUser = this.session?.user;
        if (currentUser?.permissions) {
            return arraysIntersect(currentUser.permissions, permissions);
        }
        return false;
    }

    /**
     * @description
     * Checks if the current user has all the required permissions.
     */
    public checkIfUserHasAllPermissions(permissions: Permission[]) {
        const currentUser = this.session?.user;
        if (currentUser?.permissions) {
            return permissions.every(permission => currentUser.permissions?.includes(permission));
        }
        return false;
    }
}
