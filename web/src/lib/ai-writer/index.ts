export {
	WRITER_API_DOCS_URL,
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
