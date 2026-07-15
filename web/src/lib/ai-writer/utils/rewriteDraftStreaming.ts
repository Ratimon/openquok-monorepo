export type RewriteDraftStreamingOptions = {
	context?: string;
	signal?: AbortSignal;
};

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
