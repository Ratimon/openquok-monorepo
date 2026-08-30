import type { HumanizeMode } from '$lib/ai-humanize/constants/config';

import { applyLocalHumanizeRewriteEn } from '$lib/ai-humanize/constants/locales/en/localRewrite';
import { applyLocalHumanizeRewriteTh } from '$lib/ai-humanize/constants/locales/th/localRewrite';
import { detectHumanizeLocale } from '$lib/ai-humanize/utils/localeDetect';

/**
 * Deterministic cleanup used when Chrome Rewriter is missing.
 * Locale-aware: Thai drafts (detected via the Thai Unicode block) run through
 * the th catalogs; every other input keeps the original EN pipeline.
 */
export function applyLocalHumanizeRewrite(text: string, mode: HumanizeMode): string {
	const source = (text ?? '').trim();
	if (!source) return '';
	return detectHumanizeLocale(source) === 'th'
		? applyLocalHumanizeRewriteTh(source)
		: applyLocalHumanizeRewriteEn(source, mode);
}
