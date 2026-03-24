import { AppError } from "./AppError";

/**
 * Base class for User domain errors. Subclasses set statusCode and options;
 * the global handler treats them as AppError (generic handling by statusCode).
 */
export class UserError extends AppError {
    constructor(
        message: string,
        statusCode: number,
        options: { metadata?: Record<string, unknown>; cause?: Error | null; errorCode?: string } = {}
    ) {
        super(message, statusCode, { ...options, errorCode: options.errorCode ?? "USER_ERROR" });
        this.name = "UserError";
    }
}

export class UserNotFoundError extends UserError {
    constructor(identifier = "") {
        const message = identifier ? `User not found: ${identifier}` : "User not found";
        super(message, 404, { errorCode: "USER_NOT_FOUND", metadata: identifier ? { identifier } : {} });
        this.name = "UserNotFoundError";
    }
}

export class UserAuthorizationError extends UserError {
    constructor(message = "Not authorized", requiredPermission: string | null = null) {
        super(message, 403, {
            errorCode: "FORBIDDEN",
            metadata: requiredPermission != null ? { requiredPermission } : {},
        });
        this.name = "UserAuthorizationError";
    }
}

/** Thrown when request input fails validation (e.g. missing file, invalid bucket). */
export class UserValidationError extends UserError {
    constructor(message = "Invalid request", validationErrors: unknown = null) {
        super(message, 400, {
            errorCode: "USER_VALIDATION_ERROR",
            metadata: { validationErrors },
        });
        this.name = "UserValidationError";
    }
}
