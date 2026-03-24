export class ValidationError extends Error {
    public readonly statusCode = 400;

    constructor(message: string, options?: { cause?: Error }) {
        super(message);
        this.name = "ValidationError";
        if (options?.cause) (this as Error & { cause?: Error }).cause = options.cause;
    }
}

/**
 * Base infrastructure error (e.g. Supabase/auth failure).
 */
export class InfraError extends Error {
    public readonly statusCode: number;
    public readonly component: string;
    public readonly operation?: string;
    public cause?: Error;

    constructor(
        message: string,
        options: {
            statusCode?: number;
            cause?: Error;
            component?: string;
            operation?: string;
        } = {}
    ) {
        super(message);
        this.name = "InfraError";
        this.statusCode = options.statusCode ?? 500;
        this.component = options.component ?? "infrastructure";
        this.operation = options.operation;
        this.cause = options.cause;
    }
}

export class DatabaseError extends Error {
    public readonly statusCode: number;
    public readonly metadata: Record<string, unknown>;

    constructor(
        message: string,
        options: {
            statusCode?: number;
            cause?: Error;
            operation?: string;
            resource?: { type: string; name: string };
            entityType?: string;
            metadata?: Record<string, unknown>;
        } = {}
    ) {
        super(message);
        this.name = "DatabaseError";
        this.statusCode = options.statusCode ?? 500;
        this.metadata = {
            cause: options.cause,
            operation: options.operation,
            resource: options.resource,
            entityType: options.entityType,
            ...options.metadata,
        };
    }
}

export class DatabaseEntityNotFoundError extends DatabaseError {
    constructor(
        entityType: string,
        identifier: Record<string, unknown>,
        options?: { entityType?: string }
    ) {
        super(`Entity not found: ${entityType}`, {
            statusCode: 404,
            entityType: options?.entityType ?? entityType,
            metadata: { identifier },
        });
        this.name = "DatabaseEntityNotFoundError";
    }
}
