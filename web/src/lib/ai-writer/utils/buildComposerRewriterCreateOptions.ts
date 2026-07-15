import type { ComposerWriterDraftConstraints } from '$lib/ai-writer/utils/buildComposerWriterCreateOptions';
import type { ComposerRewriterRefineAction } from '$lib/ai-writer/constants/config';

import {
	COMPOSER_REWRITER_DEFAULTS,
	COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS
} from '$lib/ai-writer/constants/config';
import { buildComposerWriterSharedContext } from '$lib/ai-writer/utils/buildComposerWriterCreateOptions';

/** Create-time Rewriter fields for a single refine action (tone/length immutable). */
export type ComposerRewriterCreateCoreOptions = {
	sharedContext: string;
	tone: RewriterTone;
	format: typeof COMPOSER_REWRITER_DEFAULTS.format;
	length: RewriterLength;
	expectedInputLanguages: string[];
	expectedContextLanguages: string[];
	outputLanguage: string;
};

export type BuildComposerRewriterCreateOptionsInput = {
	/** Relative tone/length from a refine chip (or defaults to as-is). */
	tone?: RewriterTone;
	length?: RewriterLength;
	/**
	 * Composer constraints for soft char limits / target platforms.
	 * Reuses Writer sharedContext so refine still respects draft limits.
	 */
	constraints?: ComposerWriterDraftConstraints;
};

/**
 * Resolves full Rewriter.create / availability options for a refine action,
 * reusing Writer constraint-aware `sharedContext`.
 */
export function buildComposerRewriterCreateOptions(
	input: BuildComposerRewriterCreateOptionsInput = {}
): ComposerRewriterCreateCoreOptions {
	const constraints = input.constraints ?? {
		maxCharacters: COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS,
		composerMode: 'global' as const
	};
	const max = Number.isFinite(constraints.maxCharacters)
		? Math.max(1, Math.floor(constraints.maxCharacters))
		: COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS;

	return {
		tone: input.tone ?? COMPOSER_REWRITER_DEFAULTS.tone,
		format: COMPOSER_REWRITER_DEFAULTS.format,
		length: input.length ?? COMPOSER_REWRITER_DEFAULTS.length,
		expectedInputLanguages: [...COMPOSER_REWRITER_DEFAULTS.expectedInputLanguages],
		expectedContextLanguages: [...COMPOSER_REWRITER_DEFAULTS.expectedContextLanguages],
		outputLanguage: COMPOSER_REWRITER_DEFAULTS.outputLanguage,
		sharedContext: buildComposerWriterSharedContext({ ...constraints, maxCharacters: max })
	};
}

/** Maps a refine chip to Rewriter create options (plus optional composer constraints). */
export function buildComposerRewriterCreateOptionsFromAction(
	action: Pick<ComposerRewriterRefineAction, 'tone' | 'length'>,
	constraints?: ComposerWriterDraftConstraints
): ComposerRewriterCreateCoreOptions {
	return buildComposerRewriterCreateOptions({
		tone: action.tone,
		length: action.length,
		constraints
	});
}
