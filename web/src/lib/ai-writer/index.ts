export {
	WRITER_API_DOCS_URL,
	WRITER_SOFT_OPT_IN_STORAGE_KEY,
	COMPOSER_WRITER_BASE_SHARED_CONTEXT,
	COMPOSER_WRITER_LENGTH_SHORT_MAX_CHARS,
	COMPOSER_WRITER_LENGTH_MEDIUM_MAX_CHARS,
	COMPOSER_WRITER_DEFAULTS,
	COMPOSER_WRITER_SUGGESTIONS
} from '$lib/ai-writer/constants/config';

export { isWriterSupported } from '$lib/ai-writer/utils/isWriterSupported';
export {
	getWriterAvailability,
	type WriterAvailability
} from '$lib/ai-writer/utils/getWriterAvailability';
export {
	createComposerWriter,
	type CreateComposerWriterOptions,
	type WriterSession
} from '$lib/ai-writer/utils/createComposerWriter';
export {
	writeDraftStreaming,
	type WriteDraftStreamingOptions
} from '$lib/ai-writer/utils/writeDraftStreaming';
export { destroyWriter } from '$lib/ai-writer/utils/destroyWriter';
export { hasWriterSoftOptIn } from '$lib/ai-writer/utils/hasWriterSoftOptIn';
export { acceptWriterSoftOptIn } from '$lib/ai-writer/utils/acceptWriterSoftOptIn';
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
	WriterPresenter,
	type WriterUiPhase,
	type WriterRunWriteOptions,
	type WriterChatMessageViewModel,
	type WriterChatRole
} from '$lib/ai-writer/Writer.presenter.svelte';
