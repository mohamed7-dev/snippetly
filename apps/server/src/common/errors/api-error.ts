import { ApiError } from '@snippetly/common/errors';
import { AppEntity } from '../../infra/database/app-entity';

/**
 * @description
 * Type helper that extracts only the error results from a union type.
 * Filters out non-error types from a result union.
 */
export type JustErrorResults<T extends ApiError | U, U = any> = Exclude<T, T extends ApiError ? never : T>;

/**
 * @description
 * Type representing a union of error results and entity results.
 * Used for service methods that can return either an error or a successful entity result.
 */
export type ErrorResultUnion<T extends ApiError | U, E extends AppEntity, U = any> = JustErrorResults<T> | E;

/**
 * @description
 * Type guard function to check if a result is a API error.
 * Used to determine if a service method returned an error or a successful result.
 */
export function isApiError<T extends ApiError | U, U = any>(input: T): input is JustErrorResults<T>;
export function isApiError<T, E extends AppEntity>(
    input: ErrorResultUnion<T, E>,
): input is JustErrorResults<ErrorResultUnion<T, E>> {
    return (
        input &&
        !!((input as unknown as ApiError).code && (input as unknown as ApiError).message != null) &&
        (input as unknown as ApiError).statusCode != null
    );
}
