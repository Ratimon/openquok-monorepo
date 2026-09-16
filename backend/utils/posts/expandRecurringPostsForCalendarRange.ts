import type { SocialPostLike } from "../dtos/PostDTO";
import { addUtcDays } from "./recurringPublishDate";

/** Calendar row with optional anchor when `publish_date` is a virtual recurrence. */
export type CalendarExpandedSocialPostLike = SocialPostLike & {
    series_anchor_publish_date?: string;
};

function occurrenceKey(id: string, publishDate: string): string {
    return `${id}@${publishDate}`;
}

function isExpandableRecurringAnchor(row: SocialPostLike): boolean {
    const interval = row.interval_in_days;
    if (interval == null || interval <= 0) return false;
    return row.state === "DRAFT" || row.state === "QUEUE";
}

/**
 * Expands DRAFT/QUEUE recurring anchors into one row per occurrence in `[startIso, endIso]`.
 * Non-recurring and PUBLISHED rows pass through unchanged.
 */
export function expandRecurringPostsForCalendarRange(
    rows: SocialPostLike[],
    startIso: string,
    endIso: string
): CalendarExpandedSocialPostLike[] {
    const startMs = new Date(startIso).getTime();
    const endMs = new Date(endIso).getTime();
    const seen = new Set<string>();
    const result: CalendarExpandedSocialPostLike[] = [];

    for (const row of rows) {
        if (!isExpandableRecurringAnchor(row)) {
            const key = occurrenceKey(row.id, row.publish_date);
            if (seen.has(key)) continue;
            seen.add(key);
            result.push(row);
            continue;
        }

        const anchorDate = row.publish_date;
        const interval = row.interval_in_days!;
        let cursor = anchorDate;
        let cursorMs = new Date(cursor).getTime();

        if (Number.isNaN(cursorMs)) {
            const key = occurrenceKey(row.id, row.publish_date);
            if (!seen.has(key)) {
                seen.add(key);
                result.push(row);
            }
            continue;
        }

        while (cursorMs < startMs) {
            cursor = addUtcDays(cursor, interval);
            cursorMs = new Date(cursor).getTime();
            if (Number.isNaN(cursorMs)) break;
        }

        while (cursorMs <= endMs) {
            const key = occurrenceKey(row.id, cursor);
            if (!seen.has(key)) {
                seen.add(key);
                const isVirtual = cursor !== anchorDate;
                result.push({
                    ...row,
                    publish_date: cursor,
                    ...(isVirtual ? { series_anchor_publish_date: anchorDate } : {}),
                });
            }
            cursor = addUtcDays(cursor, interval);
            cursorMs = new Date(cursor).getTime();
            if (Number.isNaN(cursorMs)) break;
        }
    }

    result.sort((a, b) => a.publish_date.localeCompare(b.publish_date));
    return result;
}
