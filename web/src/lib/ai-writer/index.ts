export {
	WRITER_API_DOCS_URL,
	REWRITER_API_DOCS_URL,
	WRITER_SOFT_OPT_IN_STORAGE_KEY,
	REWRITER_SOFT_OPT_IN_STORAGE_KEY,
	COMPOSER_WRITER_BASE_SHARED_CONTEXT,
	COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS,
	COMPOSER_WRITER_LENGTH_MEDIUM_MAX_CHARS,
	COMPOSER_WRITER_DEFAULTS,
	COMPOSER_REWRITER_DEFAULTS,
	COMPOSER_WRITER_SUGGESTIONS,
	COMPOSER_REWRITER_REFINE_ACTIONS,
	type ComposerRewriterRefineAction,
	type ComposerRewriterRefineActionId
} from '$lib/ai-writer/constants/config';

export { isWriterSupported } from '$lib/ai-writer/utils/isWriterSupported';
export { isRewriterSupported } from '$lib/ai-writer/utils/isRewriterSupported';
export {
	getWriterAvailability,
	type WriterAvailability
} from '$lib/ai-writer/utils/getWriterAvailability';
export {
	getRewriterAvailability,
	type RewriterAvailability
} from '$lib/ai-writer/utils/getRewriterAvailability';
export {
	createComposerWriter,
	type CreateComposerWriterOptions,
	type WriterSession
} from '$lib/ai-writer/utils/createComposerWriter';
export {
	createComposerRewriter,
	type CreateComposerRewriterOptions,
	type RewriterSession
} from '$lib/ai-writer/utils/createComposerRewriter';
export {
	writeDraftStreaming,
	type WriteDraftStreamingOptions
} from '$lib/ai-writer/utils/writeDraftStreaming';
export {
	rewriteDraftStreaming,
	type RewriteDraftStreamingOptions
} from '$lib/ai-writer/utils/rewriteDraftStreaming';
export { destroyAiSession } from '$lib/ai-writer/utils/destroyAiSession';
export { destroyWriter } from '$lib/ai-writer/utils/destroyWriter';
export { hasWriterSoftOptIn } from '$lib/ai-writer/utils/hasWriterSoftOptIn';
export { acceptWriterSoftOptIn } from '$lib/ai-writer/utils/acceptWriterSoftOptIn';
export { hasRewriterSoftOptIn } from '$lib/ai-writer/utils/hasRewriterSoftOptIn';
export { acceptRewriterSoftOptIn } from '$lib/ai-writer/utils/acceptRewriterSoftOptIn';
export {
	buildComposerWriterCreateOptions,
	buildComposerWriterSharedContext,
	formatWriterConstraintTargetLabel,
	normalizeWriterProviderIdentifiers,
	toWriterConstraintProviders,
	writerLengthForMaxCharacters,
	type ComposerWriterConstraintProvider,
	type ComposerWriterCreateCoreOptions,
	type ComposerWriterDraftConstraints,
	type ComposerWriterLength
} from '$lib/ai-writer/utils/buildComposerWriterCreateOptions';
export {
	buildComposerRewriterCreateOptions,
	buildComposerRewriterCreateOptionsFromAction,
	type BuildComposerRewriterCreateOptionsInput,
	type ComposerRewriterCreateCoreOptions
} from '$lib/ai-writer/utils/buildComposerRewriterCreateOptions';
export { formatWriterProviderConstraintTooltip } from '$lib/ai-writer/utils/formatWriterProviderConstraintTooltip';

export {
	WriterPresenter,
	type WriterUiPhase,
	type RewriterUiGate,
	type WriterRunWriteOptions,
	type WriterChatMessageViewModel,
	type WriterChatRole
} from '$lib/ai-writer/Writer.presenter.svelte';
