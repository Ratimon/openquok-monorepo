export class AuthError extends Error {
    public readonly statusCode: number;
    public readonly status: string;
    public readonly isOperational: boolean;
    public metadata: { error: string; errorType: string };
    public cause: Error | null;

    constructor(
        message: string,
        statusCode = 400,
        options: { metadata?: Record<string, unknown>; cause?: Error | null } = {}
    ) {
        super(message);
        this.statusCode = statusCode;
        this.status = "fail";
        this.isOperational = true;
        this.metadata = { error: "auth", errorType: "AUTH_ERROR" };
        this.cause = options.cause ?? null;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class AuthValidationError extends AuthError {
    constructor(message = "Invalid auth data", options: { cause?: Error; metadata?: Record<string, unknown> } = {}) {
        super(message, 400, options);
        this.name = "AuthValidationError";
        this.metadata = { ...this.metadata, ...options.metadata };
    }
}

export class InvalidCredentialsError extends AuthError {
    constructor(message = "Invalid credentials") {
        super(message, 401);
        this.name = "InvalidCredentialsError";
        this.metadata.errorType = "INVALID_CREDENTIALS_ERROR";
    }
}

export class MissingVerificationTokenError extends AuthError {
    constructor(message = "Missing token") {
        super(message, 400);
        this.name = "MissingVerificationTokenError";
        this.metadata.errorType = "MISSING_TOKEN_ERROR";
    }
}

export class TokenError extends AuthError {
    public readonly isTokenExpired: boolean;

    constructor(message = "Invalid or missing token", isExpired = false) {
        super(message, 401);
        this.name = "TokenError";
        this.metadata.errorType = isExpired ? "TOKEN_EXPIRED_ERROR" : "TOKEN_ERROR";
        this.isTokenExpired = isExpired;
    }
}

export class MissingUserIdError extends AuthError {
    constructor(message = "Missing user ID") {
        super(message, 401);
        this.name = "MissingUserIdError";
        this.metadata.errorType = "MISSING_USER_ID_ERROR";
    }
}

export class NotVerifiedUserError extends AuthError {
    constructor(message = "User is not verified") {
        super(message, 403);
        this.name = "NotVerifiedUserError";
        this.metadata.errorType = "NOT_VERIFIED_USER_ERROR";
    }
}

export class AuthNotFoundError extends AuthError {
    constructor(
        identifier = "",
        options: { cause?: Error; metadata?: Record<string, unknown> } = {}
    ) {
        const message = identifier ? `Auth entity not found: ${identifier}` : "Auth entity not found";
        super(message, 404);
        this.metadata = { ...this.metadata, ...options.metadata };
        this.name = "AuthNotFoundError";
    }
}

export class UserConflictError extends AuthError {
    constructor(message = "User already exists") {
        super(message, 409);
        this.name = "UserConflictError";
        this.metadata.errorType = "USER_CONFLICT_ERROR";
    }
}

export class IncorrectUserIDError extends AuthError {
    constructor(message = "Incorrect user ID") {
        super(message, 422);
        this.name = "IncorrectUserIDError";
        this.metadata.errorType = "INCORRECT_USER_ID_ERROR";
    }
}

/** Thrown when the user is authenticated but lacks the required role or permission. */
export class PermissionError extends AuthError {
    constructor(requiredRoleOrPermission: string) {
        super(`Permission denied. Required: ${requiredRoleOrPermission}`, 403);
        this.name = "PermissionError";
        this.metadata.errorType = "PERMISSION_ERROR";
    }
}
