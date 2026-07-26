/**
 * Minimal HTML → plain text for provider captions (Threads/LinkedIn/etc. expect plain text).
 * Preserves line breaks so published posts keep the paragraph structure from the composer.
 */
export function htmlToPlainText(html: string): string {
    if (!html) return "";
    return html
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
