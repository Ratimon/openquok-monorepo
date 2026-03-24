import { AppError } from "./AppError";

/**
 * Base class for Organization domain errors.
 */
export class OrganizationError extends AppError {
    constructor(
        message: string,
        statusCode: number,
        options: { metadata?: Record<string, unknown>; cause?: Error | null; errorCode?: string } = {}
    ) {
        super(message, statusCode, { ...options, errorCode: options.errorCode ?? "ORGANIZATION_ERROR" });
        this.name = "OrganizationError";
    }
}

export class OrganizationNotFoundError extends OrganizationError {
    constructor(identifier = "") {
        const message = identifier ? `Organization not found: ${identifier}` : "Organization not found";
        super(message, 404, { errorCode: "ORGANIZATION_NOT_FOUND", metadata: identifier ? { identifier } : {} });
        this.name = "OrganizationNotFoundError";
    }
}

export class OrganizationForbiddenError extends OrganizationError {
    constructor(message = "You do not have permission to perform this action") {
        super(message, 403, { errorCode: "ORGANIZATION_FORBIDDEN" });
        this.name = "OrganizationForbiddenError";
    }
}
