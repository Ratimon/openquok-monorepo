import { AppError } from "./AppError";

export class AutoLaunchProfileNotFoundError extends AppError {
    constructor(profileId: string) {
        super(`Auto-launch product profile not found: ${profileId}`, 404);
        this.name = "AutoLaunchProfileNotFoundError";
    }
}

export class AutoLaunchDestinationNotFoundError extends AppError {
    constructor(identifier: string) {
        super(`Auto-launch destination not found: ${identifier}`, 404);
        this.name = "AutoLaunchDestinationNotFoundError";
    }
}

export class AutoLaunchSubmissionNotFoundError extends AppError {
    constructor(submissionId: string) {
        super(`Auto-launch submission not found: ${submissionId}`, 404);
        this.name = "AutoLaunchSubmissionNotFoundError";
    }
}

export class AutoLaunchIntentNotAvailableError extends AppError {
    constructor(message: string) {
        super(message, 400);
        this.name = "AutoLaunchIntentNotAvailableError";
    }
}

export class AutoLaunchTokenInvalidError extends AppError {
    constructor() {
        super("Launch token is invalid or expired", 401);
        this.name = "AutoLaunchTokenInvalidError";
    }
}
