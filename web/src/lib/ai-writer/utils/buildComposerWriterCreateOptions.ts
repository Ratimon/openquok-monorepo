import {
	COMPOSER_WRITER_BASE_SHARED_CONTEXT,
	COMPOSER_WRITER_DEFAULTS,
	COMPOSER_WRITER_LENGTH_MEDIUM_MAX_CHARS,
	COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS
} from '$lib/ai-writer/constants/config';
import { socialProviderDisplayLabel } from '$data/social-providers';

export type ComposerWriterLength = 'short' | 'medium' | 'long';

/** One platform shown in the AI Writer constraint strip / sharedContext target. */
export type ComposerWriterConstraintProvider = {
	identifier: string;
	label: string;
};

export type ComposerWriterDraftConstraints = {
	/** Composer soft character limit (Global Edit default or focused provider max). */
	maxCharacters: number;
	/**
	 * Platforms the draft must satisfy (focused channel in custom mode, or unique
	 * identifiers from selected channels in Global Edit).
	 */
	providerIdentifiers?: readonly string[] | null;
	/** @deprecated Prefer {@link providerIdentifiers}; still used when the array is empty. */
	providerIdentifier?: string | null;
	composerMode?: 'global' | 'custom';
};

/** Create-time Writer fields that vary with composer constraints. */
export type ComposerWriterCreateCoreOptions = {
	sharedContext: string;
	length: ComposerWriterLength;
	tone: typeof COMPOSER_WRITER_DEFAULTS.tone;
	format: typeof COMPOSER_WRITER_DEFAULTS.format;
	expectedInputLanguages: string[];
	expectedContextLanguages: string[];
	outputLanguage: string;
};

/** Maps a soft char limit onto Chrome Writer's coarse `length` hint. */
export function writerLengthForMaxCharacters(maxCharacters: number): ComposerWriterLength {
	const n = Number.isFinite(maxCharacters) ? Math.max(0, Math.floor(maxCharacters)) : 0;
	if (n <= COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS) return 'short';
	if (n <= COMPOSER_WRITER_LENGTH_MEDIUM_MAX_CHARS) return 'medium';
	return 'long';
}

/** Dedupes catalog identifiers while preserving first-seen order. */
export function normalizeWriterProviderIdentifiers(
	identifiers: readonly string[] | null | undefined
): string[] {
	const out: string[] = [];
	const seen = new Set<string>();
	for (const raw of identifiers ?? []) {
		const id = raw.trim();
		if (!id) continue;
		const key = id.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(id);
	}
	return out;
}

export function toWriterConstraintProviders(
	identifiers: readonly string[] | null | undefined
): ComposerWriterConstraintProvider[] {
	return normalizeWriterProviderIdentifiers(identifiers).map((identifier) => ({
		identifier,
		label: socialProviderDisplayLabel(identifier)
	}));
}

/**
 * Human-readable target for Writer sharedContext, e.g. `Instagram`,
 * `Instagram and X`, or `Global Edit` when no platforms are selected.
 */
export function formatWriterConstraintTargetLabel(
	providers: readonly ComposerWriterConstraintProvider[],
	composerMode: 'global' | 'custom' = 'global'
): string {
	if (providers.length === 0) {
		return composerMode === 'custom' ? 'this channel' : 'Global Edit';
	}
	if (providers.length === 1) return providers[0]!.label;
	if (providers.length === 2) {
		return `${providers[0]!.label} and ${providers[1]!.label}`;
	}
	const head = providers
		.slice(0, -1)
		.map((p) => p.label)
		.join(', ');
	const last = providers[providers.length - 1]!.label;
	return `${head}, and ${last}`;
}

function resolveConstraintProviders(
	constraints: ComposerWriterDraftConstraints
): ComposerWriterConstraintProvider[] {
	const fromList = normalizeWriterProviderIdentifiers(constraints.providerIdentifiers);
	if (fromList.length > 0) return toWriterConstraintProviders(fromList);
	const single = (constraints.providerIdentifier ?? '').trim();
	if (single) return toWriterConstraintProviders([single]);
	return [];
}

/** Builds a constraint-aware `sharedContext` string for Writer.create. */
export function buildComposerWriterSharedContext(constraints: ComposerWriterDraftConstraints): string {
	const max = Number.isFinite(constraints.maxCharacters)
		? Math.max(1, Math.floor(constraints.maxCharacters))
		: COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS;
	const mode = constraints.composerMode ?? 'global';
	const providers = resolveConstraintProviders(constraints);
	const target = formatWriterConstraintTargetLabel(providers, mode);
	return (
		`${COMPOSER_WRITER_BASE_SHARED_CONTEXT} ` +
		`Target: ${target}. ` +
		`Hard limit: the entire draft must be at most ${max} characters (including spaces and punctuation). ` +
		`Prefer a complete post that fits comfortably under that limit — do not pad with filler.`
	);
}

/**
 * Resolves full Writer.create / availability options for the composer,
 * merging static defaults with constraint-driven `sharedContext` and `length`.
 */
export function buildComposerWriterCreateOptions(
	constraints: ComposerWriterDraftConstraints = {
		maxCharacters: COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS,
		composerMode: 'global'
	}
): ComposerWriterCreateCoreOptions {
	const max = Number.isFinite(constraints.maxCharacters)
		? Math.max(1, Math.floor(constraints.maxCharacters))
		: COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS;

	return {
		tone: COMPOSER_WRITER_DEFAULTS.tone,
		format: COMPOSER_WRITER_DEFAULTS.format,
		expectedInputLanguages: [...COMPOSER_WRITER_DEFAULTS.expectedInputLanguages],
		expectedContextLanguages: [...COMPOSER_WRITER_DEFAULTS.expectedContextLanguages],
		outputLanguage: COMPOSER_WRITER_DEFAULTS.outputLanguage,
		length: writerLengthForMaxCharacters(max),
		sharedContext: buildComposerWriterSharedContext({ ...constraints, maxCharacters: max })
	};
}
