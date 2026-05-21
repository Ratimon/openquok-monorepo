/**
 * Normalize email for storage and lookup (trim + lowercase).
 * Use at auth boundaries (sign-in, sign-up, verify, reset) so all downstream code sees a consistent form.
 */
export function normalizeEmail(email: string | undefined | null): string {
    if (email == null || typeof email !== "string") return "";
    return email.trim().toLowerCase();
}
