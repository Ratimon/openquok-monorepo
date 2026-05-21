/** Hostnames allowed for `/api/v1/image/external-proxy` (SSRF-safe allowlist). */
export function isAllowedExternalImageHost(hostname: string): boolean {
    const h = hostname.toLowerCase();
    return (
        h === "cdninstagram.com" ||
        h.endsWith(".cdninstagram.com") ||
        h === "fbcdn.net" ||
        h.endsWith(".fbcdn.net") ||
        h === "platform-lookaside.fbsbx.com" ||
        h.endsWith(".fbsbx.com")
    );
}

export function isExternalCdnProfilePictureUrl(url: string): boolean {
    try {
        return isAllowedExternalImageHost(new URL(url).hostname);
    } catch {
        return false;
    }
}
