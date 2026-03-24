import { randomBytes } from "node:crypto";

/**
 * Generate a random verification token (same format as EmailService.generateVerificationToken).
 * Use once per suite and pass to mock so verify-signup can use the same token.
 */
export function generateRandomVerificationToken(): string {
    return randomBytes(32).toString("hex");
}
