/**
 * Normalizes a hostname for Directory SEO cache keys (lowercase apex, no scheme/path).
 */
export function normalizeSeoDomain(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;

    let hostname: string;
    try {
        hostname = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`).hostname;
    } catch {
        return null;
    }

    const domain = hostname.replace(/^www\./i, "").toLowerCase();
    const isValid =
        /^(?=.{1,253}$)[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(
            domain
        );
    return isValid ? domain : null;
}
