import type { HumanizeRegisterOverlay } from '$lib/ai-humanize/constants/writingGuide.types';

import { HUMANIZE_REGISTERS } from '$lib/ai-humanize/constants/registers';
import { REWRITER_API_DOCS_URL } from '$lib/ai-writer/constants/config';

/** Chrome Rewriter API setup guide shown in the unsupported Humanize modal state. */
export const HUMANIZE_API_DOCS_URL = REWRITER_API_DOCS_URL;

/** localStorage key for soft opt-in before creating a Humanize Rewriter session / downloading the model. */
export const HUMANIZE_SOFT_OPT_IN_STORAGE_KEY = 'ai-humanize:soft-opt-in';

export const HUMANIZE_MODES = ['human', 'roughen'] as const;

export type HumanizeMode = (typeof HUMANIZE_MODES)[number];

export const HUMANIZE_DEFAULT_MODE: HumanizeMode = 'human';

/** Mode toggle labels and short helper copy for the Humanize modal. */
export const HUMANIZE_MODE_OPTIONS = [
	{
		id: 'human' as const,
		label: 'Human',
		description: 'Rewrite so it reads less machine-written.'
	},
	{
		id: 'roughen' as const,
		label: 'Roughen',
		description: 'Rougher, more spoken. Review any invented details before you post.'
	}
] as const;

/**
 * Thai mirror of {@link HUMANIZE_MODE_OPTIONS} — same mode ids, localized
 * labels/descriptions. Selected per UI locale by
 * {@link $lib/ai-humanize/utils/uiLocale.humanizeModeOptionsFor}; EN rows stay
 * the default everywhere else.
 */
export const HUMANIZE_MODE_OPTIONS_TH = [
	{
		id: 'human' as const,
		label: 'ให้เป็นธรรมชาติ',
		description: 'ปรับข้อความให้อ่านเป็นธรรมชาติ ไม่ดูเหมือน AI เขียน'
	},
	{
		id: 'roughen' as const,
		label: 'แบบพูดคุย',
		description: 'หยาบกว่า เป็นกันเองแบบพิมพ์สด ตรวจรายละเอียดที่ถูกเติมใหม่ก่อนโพสต์'
	}
] as const;

/** Short UI strings shown around the Humanize modal sections. */
export const HUMANIZE_UI_COPY = {
	en: {
		modeSection: 'Mode',
		draftSection: 'Post draft',
		rewriteSection: 'Rewrite',
		localCleanupChip: 'Local cleanup',
		charactersSuffix: 'characters',
		tellsSuffix: 'tells'
	},
	th: {
		modeSection: 'โหมด',
		draftSection: 'โพสต์ต้นฉบับ',
		rewriteSection: 'ฉบับเขียนใหม่',
		localCleanupChip: 'ปรับข้อความในเครื่อง',
		charactersSuffix: 'ตัวอักษร',
		tellsSuffix: 'จุดสังเกต'
	}
} as const;

/** Widened UI-copy shape so any locale row is assignable. */
export type HumanizeUiCopy = {
	[K in keyof (typeof HUMANIZE_UI_COPY)['en']]: string;
};

/** Widened mode-option shape shared by every locale row. */
export type HumanizeModeOption = {
	id: HumanizeMode;
	label: string;
	description: string;
};

/**
 * Developer register overlays. Flip `enabled` here — not a third Humanize
 * modal mode. Off by default so Human / Roughen stay the only user-facing modes.
 */
export const HUMANIZE_REGISTER_OVERLAYS: {
	simplifiedTechnicalEnglish: HumanizeRegisterOverlay;
} = {
	simplifiedTechnicalEnglish: {
		enabled: false,
		id: HUMANIZE_REGISTERS.simplifiedTechnicalEnglish.id,
		sharedContext: HUMANIZE_REGISTERS.simplifiedTechnicalEnglish.sharedContext
	}
};

/** Soft upper bound aligned with Global Edit / Threads-scale composer drafts. */
export const COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS = 500;

/**
 * Defaults for composer Humanize Rewriter sessions.
 * `tone` / `length` stay the same across modes; `sharedContext` (and the session
 * cache key) is what distinguishes Human from Roughen.
 */
export const COMPOSER_HUMANIZE_DEFAULTS = {
	mode: HUMANIZE_DEFAULT_MODE,
	format: 'plain-text' as const,
	tone: 'more-casual' as const,
	length: 'as-is' as const,
	expectedInputLanguages: ['en'] as string[],
	expectedContextLanguages: ['en'] as string[],
	outputLanguage: 'en'
};
