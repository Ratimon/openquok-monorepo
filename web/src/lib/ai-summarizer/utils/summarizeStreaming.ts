export type SummarizeStreamingOptions = {
	context?: string;
	signal?: AbortSignal;
};

export type SummarizeBatchOptions = {
	context?: string;
	signal?: AbortSignal;
};

/**
 * Streams summary chunks from an existing Summarizer via `summarizeStreaming`.
 */
export async function* summarizeStreaming(
	summarizer: Summarizer,
	input: string,
	options: SummarizeStreamingOptions = {}
): AsyncGenerator<string, void, unknown> {
	const trimmed = input.trim();
	if (!trimmed) return;

	const stream = summarizer.summarizeStreaming(trimmed, {
		context: options.context?.trim() || undefined,
		signal: options.signal
	});

	yield* readStreamChunks(stream);
}

/**
 * Batch (non-streaming) summarize for intermediate chunk passes in summary-of-summaries.
 * Preserves input order; skips empty strings.
 */
export async function summarizeBatch(
	summarizer: Summarizer,
	inputs: readonly string[],
	options: SummarizeBatchOptions = {}
): Promise<string[]> {
	const results: string[] = [];
	const context = options.context?.trim() || undefined;
	const signal = options.signal;

	for (const raw of inputs) {
		const trimmed = raw.trim();
		if (!trimmed) continue;
		const summary = await summarizer.summarize(trimmed, { context, signal });
		if (summary.trim()) results.push(summary.trim());
	}
	return results;
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
