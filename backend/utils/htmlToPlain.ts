/** Minimal HTML → plain text for provider captions (Threads API expects plain text). */
export function htmlToPlainText(html: string): string {
    if (!html) return "";
    return html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
