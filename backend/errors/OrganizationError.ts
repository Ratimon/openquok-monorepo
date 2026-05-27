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
        super("Workspace not found", 404, {
            errorCode: "ORGANIZATION_NOT_FOUND",
            metadata: identifier ? { identifier } : {},
        });
        this.name = "OrganizationNotFoundError";
    }
}

export class OrganizationForbiddenError extends OrganizationError {
    constructor(message = "You do not have access to this workspace") {
        super(message, 403, { errorCode: "ORGANIZATION_FORBIDDEN" });
        this.name = "OrganizationForbiddenError";
    }
}
