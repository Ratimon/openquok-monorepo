import { AuthValidationError, InvalidCredentialsError, UserConflictError } from "../../errors/AuthError";

type SupabaseAuthErrorLike = {
    message?: string;
    code?: string;
    status?: number;
};

/**
 * Maps GoTrue `signUp` errors to operational auth errors with user-facing messages.
 * Sign-up must not reuse sign-in's generic "Invalid credentials" for password policy, duplicates, etc.
 */
export function throwMappedSupabaseSignUpError(error: SupabaseAuthErrorLike): never {
    const msg = error.message?.trim() ?? "";
    const lower = msg.toLowerCase();
    const code = error.code?.toLowerCase() ?? "";

    if (
        code === "user_already_exists" ||
        lower.includes("already registered") ||
        lower.includes("user already exists") ||
        lower.includes("already been registered") ||
        lower.includes("email address has already")
    ) {
        throw new UserConflictError("This email is already registered. Please sign in.");
    }

    if (
        code === "weak_password" ||
        lower.includes("weak") ||
        lower.includes("easy to guess") ||
        lower.includes("known to be weak") ||
        lower.includes("compromised") ||
        lower.includes("pwned")
    ) {
        throw new AuthValidationError(
            "That password is too easy to guess. Use a longer passphrase with mixed characters (for example, several random words and numbers)."
        );
    }

    if (lower.includes("password") && (lower.includes("at least") || lower.includes("characters"))) {
        throw new AuthValidationError(msg || "Password does not meet security requirements.");
    }

    if (lower.includes("rate limit") || lower.includes("too many requests") || code === "over_request_rate_limit") {
        throw new AuthValidationError("Too many sign-up attempts. Please wait a minute and try again.");
    }

    if (lower.includes("invalid") && lower.includes("email")) {
        throw new AuthValidationError("Please enter a valid email address.");
    }

    if (lower.includes("signups not allowed") || lower.includes("signup is disabled")) {
        throw new AuthValidationError("New sign-ups are not available right now. Please try again later.");
    }

    if (msg) {
        throw new AuthValidationError(msg);
    }

    throw new InvalidCredentialsError("Could not create account. Please check your details and try again.");
}

/** GoTrue returns a user with no identities when the email already exists (enumeration protection). */
export function assertNewSignUpUser(user: { identities?: unknown[] | null } | null): void {
    const identities = user?.identities;
    if (identities && identities.length === 0) {
        throw new UserConflictError(
            "This email is already registered. Sign in, or check your inbox if you still need to verify your account."
        );
    }
}
