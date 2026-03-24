/**
 * Convert a string to a URL-safe slug (lowercase, alphanumeric and hyphens).
 */
export function stringToSlug(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "post";
}
