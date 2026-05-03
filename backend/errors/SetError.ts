import { AppError } from "./AppError";

export class SetNotFoundError extends AppError {
    constructor(setId: string) {
        super(`Set not found: ${setId}`, 404);
        this.name = "SetNotFoundError";
    }
}
