import { RESERVED_USERNAMES } from "../data/constants/reservedUsernames";
import { usernameSchema } from "../data/schemas/usernameSchema";

export type UsernameAvailabilityReason = "invalid" | "reserved" | "taken";

export type UsernameAvailabilityResult = {
    available: boolean;
    reason?: UsernameAvailabilityReason;
    message?: string;
};

export function validateUsernameFormat(username: string): { ok: true } | { ok: false; message: string } {
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
        const message = parsed.error.issues[0]?.message ?? "Invalid username.";
        return { ok: false, message };
    }
    return { ok: true };
}

export function isReservedUsername(username: string): boolean {
    return RESERVED_USERNAMES.has(username.trim().toLowerCase());
}

export function evaluateUsernameAvailability(params: {
    username: string;
    isTaken: boolean;
}): UsernameAvailabilityResult {
    const trimmed = params.username.trim();
    const format = validateUsernameFormat(trimmed);
    if (!format.ok) {
        return { available: false, reason: "invalid", message: format.message };
    }
    if (isReservedUsername(trimmed)) {
        return {
            available: false,
            reason: "reserved",
            message: "This username is reserved.",
        };
    }
    if (params.isTaken) {
        return {
            available: false,
            reason: "taken",
            message: "Username is already taken. Try a different username.",
        };
    }
    return { available: true };
}
