export type WriteDraftStreamingOptions = {
	context?: string;
	signal?: AbortSignal;
};

export type RewriteDraftStreamingOptions = {
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

	yield* readStreamChunks(stream);
}

/**
 * Streams rewrite chunks from an existing Rewriter via `rewriteStreaming`.
 */
export async function* rewriteDraftStreaming(
	rewriter: Rewriter,
	input: string,
	options: RewriteDraftStreamingOptions = {}
): AsyncGenerator<string, void, unknown> {
	const trimmed = input.trim();
	if (!trimmed) return;

	const stream = rewriter.rewriteStreaming(trimmed, {
		context: options.context?.trim() || undefined,
		signal: options.signal
	});

	yield* readStreamChunks(stream);
}

async function* readStreamChunks(
	stream: ReadableStream<string>
): AsyncGenerator<string, void, unknown> {
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
