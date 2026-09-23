/**
 * Estimate reading time from blog HTML (or markdown-ish) body text.
 * Matches the docs reading-time helper (200 wpm, minimum 1 minute).
 */
export function calculateBlogReadingTimeMinutes(content: string): number {
    let stripped = content.replace(/```[\s\S]*?```/g, "");
    stripped = stripped.replace(/`[^`]*`/g, "");
    stripped = stripped.replace(/<[^>]*>/g, "");
    const words = stripped.split(/\s+/).filter((word) => word.length > 0);
    return Math.max(1, Math.ceil(words.length / 200));
}
