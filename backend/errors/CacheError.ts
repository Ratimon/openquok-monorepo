export class CacheError extends Error {
    public readonly statusCode: number;

    constructor(
        message = "Cache operation failed",
        options?: { statusCode?: number; cause?: Error }
    ) {
        super(message);
        this.name = "CacheError";
        this.statusCode = options?.statusCode ?? 500;
        if (options?.cause) (this as Error & { cause?: Error }).cause = options.cause;
    }
}

export class CacheConnectionError extends CacheError {
    constructor(message = "Failed to connect to cache", options?: { cause?: Error }) {
        super(message, { ...options, statusCode: 503 });
        this.name = "CacheConnectionError";
    }
}

export class CacheOperationError extends CacheError {
    constructor(message = "Cache operation failed", options?: { cause?: Error }) {
        super(message, { ...options, statusCode: 500 });
        this.name = "CacheOperationError";
    }
}
