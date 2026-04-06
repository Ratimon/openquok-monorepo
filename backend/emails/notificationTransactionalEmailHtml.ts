import type { DigestQueueEntry } from "../data/types/notificationEmailTypes";
import { escapeHtml } from "./htmlEscape";

/** Minimal HTML document wrapper for transactional notification mail. */
export function buildNotificationEmailDocument(bodyInner: string): string {
    return `<!DOCTYPE html><html><body>${bodyInner}</body></html>`;
}

/** Single escaped message block (in-app notification line as email fragment). */
export function buildNotificationMessageParagraph(message: string): string {
    return `<p style="margin:0 0 12px;">${escapeHtml(message)}</p>`;
}

export function buildNotificationDigestSubject(entries: DigestQueueEntry[]): string {
    if (entries.length === 1) {
        return entries[0].subject;
    }
    return `Workspace updates (${entries.length})`;
}

/** Combined digest body (inner HTML only; wrap with `buildNotificationEmailDocument` when sending). */
export function buildNotificationDigestBodyInner(entries: DigestQueueEntry[]): string {
    return entries
        .map(
            (e) =>
                `<h3 style="margin:16px 0 8px;">${escapeHtml(e.subject)}</h3>${buildNotificationMessageParagraph(e.message)}`
        )
        .join('<hr style="border:none;border-top:1px solid #eee;"/>');
}
