/**
 * Checks if a string is a valid UUID (versions 1–5).
 */
export function isValidUUID(value: string): boolean {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(value);
}
