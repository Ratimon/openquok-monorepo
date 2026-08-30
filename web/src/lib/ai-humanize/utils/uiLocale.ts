import type { HumanizeLocale } from '$lib/ai-humanize/utils/localeDetect';

import {
	HUMANIZE_MODE_OPTIONS,
	HUMANIZE_MODE_OPTIONS_TH,
	HUMANIZE_UI_COPY,
	type HumanizeModeOption,
	type HumanizeUiCopy
} from '$lib/ai-humanize/constants/config';

/**
 * UI-locale layer for the Humanize modal: picks Thai labels/copy when the
 * browser is set to Thai; every other browser locale keeps the original EN
 * strings. This is presentation-only — rewrite behavior is decided per draft
 * by {@link $lib/ai-humanize/utils/localeDetect.detectHumanizeLocale}.
 */

/** Preferred languages from `navigator`, safe for SSR/tests (empty list). */
export function browserPreferredLanguages(): readonly string[] {
	if (typeof navigator === 'undefined') return [];
	const list = navigator.languages?.length ? navigator.languages : [navigator.language];
	return (list ?? []).filter(Boolean);
}

/**
 * True when any preferred language tag starts with `th` (`th`, `th-TH`).
 */
export function prefersThaiLanguage(languages: readonly string[]): boolean {
	return languages.some((tag) => tag.toLowerCase().startsWith('th'));
}

/**
 * UI locale for modal labels. Walks the ordered `navigator.languages` list and
 * honors the first tag we have labels for (`th*` → `'th'`, `en*` → `'en'`),
 * so a user whose primary language is English keeps EN labels even when Thai
 * appears later in the list. Defaults to `'en'`.
 */
export function detectHumanizeUiLocale(languages: readonly string[] = []): HumanizeLocale {
	const tags = languages.length > 0 ? languages : browserPreferredLanguages();
	for (const tag of tags) {
		const lower = tag.toLowerCase();
		if (lower.startsWith('th')) return 'th';
		if (lower.startsWith('en')) return 'en';
	}
	return 'en';
}

/** Mode toggle rows for a UI locale — same ids, localized copy. */
export function humanizeModeOptionsFor(locale: HumanizeLocale): readonly HumanizeModeOption[] {
	return locale === 'th' ? HUMANIZE_MODE_OPTIONS_TH : HUMANIZE_MODE_OPTIONS;
}

/** Section/chip strings around the modal for a UI locale. */
export function humanizeUiCopyFor(locale: HumanizeLocale): HumanizeUiCopy {
	return HUMANIZE_UI_COPY[locale];
}
