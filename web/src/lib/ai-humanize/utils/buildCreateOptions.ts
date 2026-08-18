import type { HumanizeMode } from '$lib/ai-humanize/constants/config';
import type {
	ComposerRewriterCreateCoreOptions,
	ComposerWriterConstraintProvider
} from '$lib/ai-writer/utils/buildCreateOptions';

import {
	COMPOSER_HUMANIZE_DEFAULTS,
	COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS
} from '$lib/ai-humanize/constants/config';
import {
	COMPOSER_HUMANIZE_HUMAN_SHARED_CONTEXT,
	COMPOSER_HUMANIZE_ROUGHEN_SHARED_CONTEXT
} from '$lib/ai-humanize/constants/sharedContext';
import {
	formatWriterConstraintTargetLabel,
	normalizeWriterProviderIdentifiers,
	toWriterConstraintProviders
} from '$lib/ai-writer/utils/buildCreateOptions';

/** Platforms shown in the Humanize constraint strip / sharedContext target. */
export type ComposerHumanizeConstraintProvider = ComposerWriterConstraintProvider;

export type ComposerHumanizeDraftConstraints = {
	/** Composer soft character limit (Global Edit default or focused provider max). */
	maxCharacters: number;
	/**
	 * Platforms the rewrite must satisfy (focused channel in custom mode, or unique
	 * identifiers from selected channels in Global Edit).
	 */
	providerIdentifiers?: readonly string[] | null;
	/** @deprecated Prefer {@link providerIdentifiers}; still used when the array is empty. */
	providerIdentifier?: string | null;
	composerMode?: 'global' | 'custom';
};

/** Create-time Rewriter fields for Humanize, including `mode` for session cache keys. */
export type ComposerHumanizeCreateCoreOptions = {
	mode: HumanizeMode;
	sharedContext: string;
	tone: RewriterTone;
	format: typeof COMPOSER_HUMANIZE_DEFAULTS.format;
	length: RewriterLength;
	expectedInputLanguages: string[];
	expectedContextLanguages: string[];
	outputLanguage: string;
};

export type BuildComposerHumanizeCreateOptionsInput = {
	mode?: HumanizeMode;
	/** Composer constraints for soft char limits / target platforms. */
	constraints?: ComposerHumanizeDraftConstraints;
};

export {
	formatWriterConstraintTargetLabel as formatHumanizeConstraintTargetLabel,
	normalizeWriterProviderIdentifiers as normalizeHumanizeProviderIdentifiers,
	toWriterConstraintProviders as toHumanizeConstraintProviders
};

function resolveConstraintProviders(
	constraints: ComposerHumanizeDraftConstraints
): ComposerHumanizeConstraintProvider[] {
	const fromList = normalizeWriterProviderIdentifiers(constraints.providerIdentifiers);
	if (fromList.length > 0) return toWriterConstraintProviders(fromList);
	const single = (constraints.providerIdentifier ?? '').trim();
	if (single) return toWriterConstraintProviders([single]);
	return [];
}

function baseSharedContextForMode(mode: HumanizeMode): string {
	return mode === 'roughen'
		? COMPOSER_HUMANIZE_ROUGHEN_SHARED_CONTEXT
		: COMPOSER_HUMANIZE_HUMAN_SHARED_CONTEXT;
}

/** Builds a constraint-aware `sharedContext` string for Rewriter.create. */
export function buildComposerHumanizeSharedContext(
	mode: HumanizeMode,
	constraints: ComposerHumanizeDraftConstraints
): string {
	const max = Number.isFinite(constraints.maxCharacters)
		? Math.max(1, Math.floor(constraints.maxCharacters))
		: COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS;
	const composerMode = constraints.composerMode ?? 'global';
	const providers = resolveConstraintProviders(constraints);
	const target = formatWriterConstraintTargetLabel(providers, composerMode);
	return (
		`${baseSharedContextForMode(mode)} ` +
		`Target: ${target}. ` +
		`Hard limit: the entire rewrite must be at most ${max} characters (including spaces and punctuation). ` +
		`Prefer a complete post that fits comfortably under that limit. Do not pad with filler.`
	);
}

/**
 * Resolves full Rewriter.create / availability options for Humanize,
 * merging static defaults with mode-specific `sharedContext`.
 */
export function buildComposerHumanizeCreateOptions(
	input: BuildComposerHumanizeCreateOptionsInput = {}
): ComposerHumanizeCreateCoreOptions {
	const mode = input.mode ?? COMPOSER_HUMANIZE_DEFAULTS.mode;
	const constraints = input.constraints ?? {
		maxCharacters: COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS,
		composerMode: 'global' as const
	};
	const max = Number.isFinite(constraints.maxCharacters)
		? Math.max(1, Math.floor(constraints.maxCharacters))
		: COMPOSER_HUMANIZE_LENGTH_SHORT_MAX_CHARS;

	return {
		mode,
		tone: COMPOSER_HUMANIZE_DEFAULTS.tone,
		format: COMPOSER_HUMANIZE_DEFAULTS.format,
		length: COMPOSER_HUMANIZE_DEFAULTS.length,
		expectedInputLanguages: [...COMPOSER_HUMANIZE_DEFAULTS.expectedInputLanguages],
		expectedContextLanguages: [...COMPOSER_HUMANIZE_DEFAULTS.expectedContextLanguages],
		outputLanguage: COMPOSER_HUMANIZE_DEFAULTS.outputLanguage,
		sharedContext: buildComposerHumanizeSharedContext(mode, { ...constraints, maxCharacters: max })
	};
}

/**
 * Cache key for an on-device Rewriter session. Includes `mode` because Human and
 * Roughen share Rewriter `tone`/`length` and only differ in `sharedContext`.
 */
export function createComposerHumanizeSessionKey(core: ComposerHumanizeCreateCoreOptions): string {
	return `${core.mode}:${core.tone}:${core.length}:${core.sharedContext}`;
}

/** Drops `mode` so the remainder can be passed to {@link createComposerRewriter}. */
export function toComposerRewriterCreateOptions(
	core: ComposerHumanizeCreateCoreOptions
): ComposerRewriterCreateCoreOptions {
	return {
		sharedContext: core.sharedContext,
		tone: core.tone,
		format: core.format,
		length: core.length,
		expectedInputLanguages: core.expectedInputLanguages,
		expectedContextLanguages: core.expectedContextLanguages,
		outputLanguage: core.outputLanguage
	};
}
