export {
	WRITER_API_DOCS_URL,
	WRITER_SOFT_OPT_IN_STORAGE_KEY,
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
