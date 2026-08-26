import type { IntegrationMentionProgrammerModel } from '$lib/integrations';

/** Minimum characters after `@` before calling the mentions API (matches composer UX elsewhere). */
export const COMPOSER_MENTION_MIN_QUERY_LENGTH = 2;

const MENTION_PROVIDER_IDENTIFIERS = new Set(['x', 'linkedin', 'linkedin-page']);

export type ActiveComposerMentionQuery = {
	start: number;
	query: string;
};

export function providerSupportsComposerMentions(
	providerIdentifier: string | null | undefined
): providerIdentifier is 'x' | 'linkedin' | 'linkedin-page' {
	return Boolean(providerIdentifier && MENTION_PROVIDER_IDENTIFIERS.has(providerIdentifier));
}

/** Returns the `@`-query segment ending at `caret`, or null when not in an active mention token. */
export function detectActiveMentionQuery(
	text: string,
	caret: number
): ActiveComposerMentionQuery | null {
	if (caret < 0) return null;
	const before = text.slice(0, caret);
	const atIndex = before.lastIndexOf('@');
	if (atIndex === -1) return null;
	if (atIndex > 0 && !/\s/u.test(before.charAt(atIndex - 1))) return null;
	const query = before.slice(atIndex + 1);
	if (!query.length || /\s/u.test(query)) return null;
	return { start: atIndex, query };
}

function xHandleFromMentionLabel(label: string): string {
	const parenMatch = label.match(/\(@([^)]+)\)\s*$/u);
	if (parenMatch?.[1]) return parenMatch[1].replace(/^@/u, '').trim();
	const atMatch = label.match(/^@(\S+)/u);
	if (atMatch?.[1]) return atMatch[1].trim();
	return label.replace(/^@/u, '').trim();
}

/** Insert text that matches backend provider `mentionFormat` for X and LinkedIn channels. */
export function formatIntegrationMentionText(
	providerIdentifier: string | null | undefined,
	mention: IntegrationMentionProgrammerModel
): string {
	if (providerIdentifier === 'x') {
		const handle = xHandleFromMentionLabel(mention.label);
		return `@${handle}`;
	}
	if (providerIdentifier === 'linkedin' || providerIdentifier === 'linkedin-page') {
		const name = mention.label.replace(/^@/u, '').trim();
		return `@[${name}](urn:li:organization:${mention.id})`;
	}
	return mention.label.trim();
}

export function replaceActiveMentionWithText(
	value: string,
	mentionStart: number,
	caret: number,
	insertText: string
): { nextValue: string; nextCaret: number } {
	const nextValue = value.slice(0, mentionStart) + insertText + value.slice(caret);
	return { nextValue, nextCaret: mentionStart + insertText.length };
}

/** Replace the active `@query` in a textarea and sync the bound value via an `input` event. */
export function applyMentionToTextarea(
	el: HTMLTextAreaElement,
	mentionStart: number,
	insertText: string
): void {
	const caret = el.selectionStart ?? 0;
	const value = el.value ?? '';
	const { nextValue, nextCaret } = replaceActiveMentionWithText(value, mentionStart, caret, insertText);
	el.value = nextValue;
	el.dispatchEvent(new Event('input', { bubbles: true }));
	el.focus();
	el.setSelectionRange(nextCaret, nextCaret);
}

/** Insert literal text at the caret, replacing any selection. */
export function insertTextAtTextareaCaret(el: HTMLTextAreaElement, text: string): void {
	const start = el.selectionStart ?? 0;
	const end = el.selectionEnd ?? 0;
	const value = el.value ?? '';
	el.value = value.slice(0, start) + text + value.slice(end);
	el.dispatchEvent(new Event('input', { bubbles: true }));
	el.focus();
	const next = start + text.length;
	el.setSelectionRange(next, next);
}
