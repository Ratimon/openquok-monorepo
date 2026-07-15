export type WriteDraftStreamingOptions = {
	context?: string;
	signal?: AbortSignal;
};

/**
 * Streams draft chunks from an existing Writer via `writeStreaming`.
 */
export async function* writeDraftStreaming(
	writer: Writer,
	prompt: string,
	options: WriteDraftStreamingOptions = {}
): AsyncGenerator<string, void, unknown> {
	const trimmed = prompt.trim();
	if (!trimmed) return;

	const stream = writer.writeStreaming(trimmed, {
		context: options.context?.trim() || undefined,
		signal: options.signal
	});

	const reader = stream.getReader();
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value) yield value;
		}
	} finally {
		reader.releaseLock();
	}
}
