/** UTC calendar-day math for recurring post slots (matches calendar virtual expansion). */
export function addUtcDays(iso: string, days: number): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString();
}

/**
 * Next physical repeat slot: anchor `publish_date` plus `intervalDays` (UTC days).
 * Falls back to now + interval when the anchor is invalid.
 */
export function computeNextRepeatPublishDateIso(anchorPublishDate: string, intervalDays: number): string {
    const interval = Math.floor(intervalDays);
    const fallbackMs = interval * 24 * 60 * 60 * 1000;
    const anchorMs = new Date(anchorPublishDate).getTime();
    if (!Number.isFinite(interval) || interval <= 0 || Number.isNaN(anchorMs)) {
        return new Date(Date.now() + fallbackMs).toISOString();
    }
    return addUtcDays(anchorPublishDate, interval);
}
