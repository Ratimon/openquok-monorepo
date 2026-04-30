import { AppError } from "./AppError";

export class SignatureNotFoundError extends AppError {
    constructor(signatureId: string) {
        super(`Signature not found: ${signatureId}`, 404);
        this.name = "SignatureNotFoundError";
    }
}

