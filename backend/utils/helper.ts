/**
 * Normalize email for storage and lookup (trim + lowercase).
 * Use at auth boundaries (sign-in, sign-up, verify, reset) so all downstream code sees a consistent form.
 */
export function normalizeEmail(email: string | undefined | null): string {
    if (email == null || typeof email !== "string") return "";
    return email.trim().toLowerCase();
}

/**
 * Checks if a string is a valid UUID (versions 1–5).
 * @param value - The string to check.
 * @returns True if the string is a valid UUID.
 */
export function isValidUUID(value: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(value);
}
