import { AppError } from "./AppError";

export class RoleValidationError extends AppError {
    constructor(message: string, options: { metadata?: Record<string, unknown> } = {}) {
        super(message, 400, { ...options, errorCode: "ROLE_VALIDATION" });
        this.name = "RoleValidationError";
    }
}
