/**
 * @description
 * ApiError represents an API error with code and message.
 */
export class ApiError {
    /**
     * @description
     * Error code identifying the type of error.
     */
    code: string;

    /**
     * @description
     * HTTP status code for the error.
     */
    statusCode: number;

    /**
     * @description
     * Human-readable error message.
     */
    message: string;
}
