function hostnameIsOrUnder(hostname: string, root: string): boolean {
    return hostname === root || hostname.endsWith(`.${root}`);
}

/**
 * Hostnames allowed for `/api/v1/image/external-proxy` (SSRF-safe allowlist).
 * Keep the web matcher in `Image.repository.svelte.ts` in sync.
 */
export function isAllowedExternalImageHost(hostname: string): boolean {
    const h = hostname.toLowerCase();
    return (
        hostnameIsOrUnder(h, "cdninstagram.com") ||
        hostnameIsOrUnder(h, "fbcdn.net") ||
        hostnameIsOrUnder(h, "fbsbx.com") ||
        hostnameIsOrUnder(h, "licdn.com")
    );
}

export function isExternalCdnProfilePictureUrl(url: string): boolean {
    try {
        return isAllowedExternalImageHost(new URL(url).hostname);
    } catch {
        return false;
    }
}
