export {
	SUMMARIZER_API_DOCS_URL,
	SUMMARIZER_SOFT_OPT_IN_STORAGE_KEY,
	COMPOSER_SUMMARIZER_BASE_SHARED_CONTEXT,
	COMPOSER_SUMMARIZER_LENGTH_SHORT_MAX_CHARS,
	COMPOSER_SUMMARIZER_LENGTH_MEDIUM_MAX_CHARS,
	COMPOSER_SUMMARIZER_DEFAULTS
} from '$lib/ai-summarizer/constants/config';

export {
	isSummarizerSupported,
	getSummarizerAvailability,
	type SummarizerAvailability,
	createComposerSummarizer,
	type CreateComposerSummarizerOptions,
	type SummarizerSession,
	summarizeStreaming,
	summarizeBatch,
	type SummarizeStreamingOptions,
	type SummarizeBatchOptions,
	summarizeWithQuotaAwareStreaming,
	summaryOfSummariesBatch,
	destroyAiSession,
	destroySummarizer,
	hasSummarizerSoftOptIn,
	acceptSummarizerSoftOptIn,
	buildComposerSummarizerCreateOptions,
	buildComposerSummarizerSharedContext,
	formatSummarizerConstraintTargetLabel,
	normalizeSummarizerProviderIdentifiers,
	toSummarizerConstraintProviders,
	summarizerLengthForMaxCharacters,
	type ComposerSummarizerConstraintProvider,
	type ComposerSummarizerCreateCoreOptions,
	type ComposerSummarizerDraftConstraints,
	type ComposerSummarizerLength,
	type ComposerSummarizerType,
	type BuildComposerSummarizerCreateOptionsInput
} from '$lib/ai-summarizer/utils';

export {
	SummarizerPresenter,
	type SummarizerUiPhase,
	type SummarizerRunStatus
} from '$lib/ai-summarizer/Summarizer.presenter.svelte';
