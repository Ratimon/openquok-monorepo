/**
 * Base class for application/domain errors that carry an HTTP status code.
 * Use this so the global error handler can respond by statusCode without
 * handling each concrete error type (e.g. UserNotFoundError, UserAuthorizationError).
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational = true;
    public readonly metadata: Record<string, unknown>;
    public readonly cause: Error | null;

    constructor(
        message: string,
        statusCode: number,
        options: {
            metadata?: Record<string, unknown>;
            cause?: Error | null;
            errorCode?: string;
        } = {}
    ) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.metadata = options.metadata ?? {};
        this.cause = options.cause ?? null;
        if (options.errorCode) {
            this.metadata.errorCode = options.errorCode;
        }
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace?.(this, this.constructor);
    }
}
