import type { ComposerWriterConstraintProvider } from '$lib/ai-writer/utils/buildCreateOptions';

import {
	COMPOSER_SUMMARIZER_BASE_SHARED_CONTEXT,
	COMPOSER_SUMMARIZER_DEFAULTS,
	COMPOSER_SUMMARIZER_LENGTH_MEDIUM_MAX_CHARS,
	COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS
} from '$lib/ai-summarizer/constants/config';
import {
	formatWriterConstraintTargetLabel,
	normalizeWriterProviderIdentifiers,
	toWriterConstraintProviders
} from '$lib/ai-writer/utils/buildCreateOptions';

export type ComposerSummarizerLength = SummarizerLength;
export type ComposerSummarizerType = SummarizerType;

/** Platforms shown in the Summarize constraint strip / sharedContext target. */
export type ComposerSummarizerConstraintProvider = ComposerWriterConstraintProvider;

export type ComposerSummarizerDraftConstraints = {
	/** Composer soft character limit (Global Edit default or focused provider max). */
	maxCharacters: number;
	/**
	 * Platforms the summary must satisfy (focused channel in custom mode, or unique
	 * identifiers from selected channels in Global Edit).
	 */
	providerIdentifiers?: readonly string[] | null;
	/** @deprecated Prefer {@link providerIdentifiers}; still used when the array is empty. */
	providerIdentifier?: string | null;
	composerMode?: 'global' | 'custom';
};

/** Create-time Summarizer fields that vary with composer constraints and modal controls. */
export type ComposerSummarizerCreateCoreOptions = {
	sharedContext: string;
	type: SummarizerType;
	format: typeof COMPOSER_SUMMARIZER_DEFAULTS.format;
	length: SummarizerLength;
	expectedInputLanguages: string[];
	expectedContextLanguages: string[];
	outputLanguage: string;
};

export type BuildComposerSummarizerCreateOptionsInput = {
	/** Summary type from the modal control (defaults to tldr). */
	type?: SummarizerType;
	/** Output length from the modal control (defaults from soft char limit when omitted). */
	length?: SummarizerLength;
	/** Composer constraints for soft char limits / target platforms. */
	constraints?: ComposerSummarizerDraftConstraints;
};

/** Maps a soft char limit onto Chrome Summarizer's coarse `length` hint. */
export function summarizerLengthForMaxCharacters(maxCharacters: number): ComposerSummarizerLength {
	const n = Number.isFinite(maxCharacters) ? Math.max(0, Math.floor(maxCharacters)) : 0;
	if (n <= COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS) return 'short';
	if (n <= COMPOSER_SUMMARIZER_LENGTH_MEDIUM_MAX_CHARS) return 'medium';
	return 'long';
}

export {
	formatWriterConstraintTargetLabel as formatSummarizerConstraintTargetLabel,
	normalizeWriterProviderIdentifiers as normalizeSummarizerProviderIdentifiers,
	toWriterConstraintProviders as toSummarizerConstraintProviders
};

function resolveConstraintProviders(
	constraints: ComposerSummarizerDraftConstraints
): ComposerSummarizerConstraintProvider[] {
	const fromList = normalizeWriterProviderIdentifiers(constraints.providerIdentifiers);
	if (fromList.length > 0) return toWriterConstraintProviders(fromList);
	const single = (constraints.providerIdentifier ?? '').trim();
	if (single) return toWriterConstraintProviders([single]);
	return [];
}

/** Builds a constraint-aware `sharedContext` string for Summarizer.create. */
export function buildComposerSummarizerSharedContext(
	constraints: ComposerSummarizerDraftConstraints
): string {
	const max = Number.isFinite(constraints.maxCharacters)
		? Math.max(1, Math.floor(constraints.maxCharacters))
		: COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS;
	const mode = constraints.composerMode ?? 'global';
	const providers = resolveConstraintProviders(constraints);
	const target = formatWriterConstraintTargetLabel(providers, mode);
	return (
		`${COMPOSER_SUMMARIZER_BASE_SHARED_CONTEXT} ` +
		`Target: ${target}. ` +
		`Hard limit: the entire summary must be at most ${max} characters (including spaces and punctuation). ` +
		`Prefer a complete post that fits comfortably under that limit — do not pad with filler.`
	);
}

/**
 * Resolves full Summarizer.create / availability options for the composer,
 * merging static defaults with constraint-driven `sharedContext` and optional type/length.
 */
export function buildComposerSummarizerCreateOptions(
	input: BuildComposerSummarizerCreateOptionsInput = {}
): ComposerSummarizerCreateCoreOptions {
	const constraints = input.constraints ?? {
		maxCharacters: COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS,
		composerMode: 'global' as const
	};
	const max = Number.isFinite(constraints.maxCharacters)
		? Math.max(1, Math.floor(constraints.maxCharacters))
		: COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS;

	return {
		type: input.type ?? COMPOSER_SUMMARIZER_DEFAULTS.type,
		format: COMPOSER_SUMMARIZER_DEFAULTS.format,
		length: input.length ?? summarizerLengthForMaxCharacters(max),
		expectedInputLanguages: [...COMPOSER_SUMMARIZER_DEFAULTS.expectedInputLanguages],
		expectedContextLanguages: [...COMPOSER_SUMMARIZER_DEFAULTS.expectedContextLanguages],
		outputLanguage: COMPOSER_SUMMARIZER_DEFAULTS.outputLanguage,
		sharedContext: buildComposerSummarizerSharedContext({ ...constraints, maxCharacters: max })
	};
}
