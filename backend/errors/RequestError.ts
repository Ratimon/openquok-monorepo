/**
 * Item shape for request validation errors (e.g. from Zod flatten).
 * Used by validateRequest middleware; do not confuse with InfraError.ValidationError.
 */
export type RequestValidationErrorItem = {
    param: string;
    type: string;
};

/**
 * Thrown when request params, query, or body fail schema validation.
 */
export class RequestError extends Error {
    public readonly statusCode = 400;
    public readonly errorList: RequestValidationErrorItem[];

    constructor(errorList: RequestValidationErrorItem[]) {
        super("Request validation failed");
        this.name = "RequestError";
        this.errorList = errorList;
    }
}
