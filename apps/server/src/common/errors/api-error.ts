import { AppEntity } from '../../infra/database/app-entity';

/**
 * @description
 * ApiError represents an API error with code and message.
 */
export interface AppApiError {
    /**
     * @description
     * Error code identifying the type of error.
     */
    code: string;

    /**
     * @description
     * HTTP status code for the error.
     */
    httpStatusCode: number;

    /**
     * @description
     * Human-readable error message.
     */
    message: string;
}

/**
 * @description
 * Type helper that extracts only the error results from a union type.
 * Filters out non-error types from a result union.
 */
export type JustErrorResults<T extends AppApiError | U, U = any> = Exclude<
    T,
    T extends AppApiError ? never : T
>;

/**
 * @description
 * Type representing a union of error results and entity results.
 * Used for service methods that can return either an error or a successful entity result.
 */
export type ErrorResultUnion<T extends AppApiError | U, E extends AppEntity, U = any> =
    | JustErrorResults<T>
    | E;

/**
 * @description
 * Type guard function to check if a result is a API error.
 * Used to determine if a service method returned an error or a successful result.
 */
export function isApiError<T extends AppApiError | U, U = any>(input: T): input is JustErrorResults<T>;
export function isApiError<T, E extends AppEntity>(
    input: ErrorResultUnion<T, E>,
): input is JustErrorResults<ErrorResultUnion<T, E>> {
    return (
        input &&
        !!((input as unknown as AppApiError).code && (input as unknown as AppApiError).message != null) &&
        (input as unknown as AppApiError).httpStatusCode != null
    );
}
