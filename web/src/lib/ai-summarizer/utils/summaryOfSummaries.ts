import {
	summarizeBatch,
	summarizeStreaming,
	type SummarizeStreamingOptions
} from '$lib/ai-summarizer/utils/summarizeStreaming';

/** Leave headroom so chunk + context stay under the model window. */
const QUOTA_SAFETY_RATIO = 0.85;

/** Fallback when `inputQuota` is finite but measure fails for tiny probes. */
const FALLBACK_CHUNK_CHARS = 3000;

/**
 * Quota-aware summarize: if `measureInputUsage(text) > inputQuota`, splits by
 * paragraphs, batch-summarizes chunks (summary-of-summaries), then streams the final pass.
 * Prefer {@link summarizeStreaming} when the input already fits.
 */
export async function* summarizeWithQuotaAwareStreaming(
	summarizer: Summarizer,
	input: string,
	options: SummarizeStreamingOptions = {}
): AsyncGenerator<string, void, unknown> {
	const trimmed = input.trim();
	if (!trimmed) return;

	const signal = options.signal;
	const context = options.context?.trim() || undefined;
	throwIfAborted(signal);

	const fits = await inputFitsQuota(summarizer, trimmed, { context, signal });
	throwIfAborted(signal);

	if (fits) {
		yield* summarizeStreaming(summarizer, trimmed, options);
		return;
	}

	const condensed = await summaryOfSummariesBatch(summarizer, trimmed, {
		context,
		signal
	});
	throwIfAborted(signal);

	if (!condensed.trim()) return;
	yield* summarizeStreaming(summarizer, condensed, options);
}

/**
 * Paragraph-chunk → batch summarize → concat loop until the text fits quota
 * (or a single chunk remains). Used for intermediate summary-of-summaries passes.
 */
export async function summaryOfSummariesBatch(
	summarizer: Summarizer,
	input: string,
	options: SummarizeStreamingOptions = {}
): Promise<string> {
	let current = input.trim();
	if (!current) return '';

	const context = options.context?.trim() || undefined;
	const signal = options.signal;
	const maxPasses = 8;

	for (let pass = 0; pass < maxPasses; pass++) {
		throwIfAborted(signal);
		if (await inputFitsQuota(summarizer, current, { context, signal })) {
			return current;
		}

		const chunks = await packParagraphChunks(summarizer, current, { context, signal });
		throwIfAborted(signal);

		if (chunks.length <= 1) {
			// Single oversize chunk (or no paragraph breaks): force a summarize to shrink.
			const forced = await summarizeBatch(summarizer, [current], { context, signal });
			return forced[0]?.trim() || current;
		}

		const partials = await summarizeBatch(summarizer, chunks, { context, signal });
		const joined = partials.join('\n\n').trim();
		if (!joined || joined === current) return joined || current;
		current = joined;
	}

	return current;
}

async function inputFitsQuota(
	summarizer: Summarizer,
	text: string,
	options: { context?: string; signal?: AbortSignal }
): Promise<boolean> {
	const quota = summarizer.inputQuota;
	if (!Number.isFinite(quota) || quota === Number.POSITIVE_INFINITY) return true;
	try {
		const usage = await summarizer.measureInputUsage(text, {
			context: options.context,
			signal: options.signal
		});
		return usage <= quota;
	} catch {
		// If measure fails, attempt a direct path; callers may still QuotaExceeded.
		return text.length <= FALLBACK_CHUNK_CHARS;
	}
}

/**
 * Packs paragraphs into chunks whose measured usage stays under a safe fraction of quota.
 * Falls back to sentence / hard character splits when a single paragraph exceeds quota.
 */
async function packParagraphChunks(
	summarizer: Summarizer,
	text: string,
	options: { context?: string; signal?: AbortSignal }
): Promise<string[]> {
	const paragraphs = splitParagraphs(text);
	if (paragraphs.length === 0) return [text];

	const quota = summarizer.inputQuota;
	const budget =
		Number.isFinite(quota) && quota !== Number.POSITIVE_INFINITY
			? quota * QUOTA_SAFETY_RATIO
			: Number.POSITIVE_INFINITY;

	const chunks: string[] = [];
	let current = '';

	for (const paragraph of paragraphs) {
		throwIfAborted(options.signal);

		const pieces =
			(await measureUsage(summarizer, paragraph, options)) > budget
				? await splitOversizedUnit(summarizer, paragraph, budget, options)
				: [paragraph];

		for (const piece of pieces) {
			const candidate = current ? `${current}\n\n${piece}` : piece;
			const usage = await measureUsage(summarizer, candidate, options);
			if (current && usage > budget) {
				chunks.push(current);
				current = piece;
			} else {
				current = candidate;
			}
		}
	}

	if (current) chunks.push(current);
	return chunks.length > 0 ? chunks : [text];
}

async function splitOversizedUnit(
	summarizer: Summarizer,
	unit: string,
	budget: number,
	options: { context?: string; signal?: AbortSignal }
): Promise<string[]> {
	const sentences = splitSentences(unit);
	if (sentences.length > 1) {
		const out: string[] = [];
		let current = '';
		for (const sentence of sentences) {
			throwIfAborted(options.signal);
			const candidate = current ? `${current} ${sentence}` : sentence;
			const usage = await measureUsage(summarizer, candidate, options);
			if (current && usage > budget) {
				out.push(current);
				current = sentence;
			} else {
				current = candidate;
			}
		}
		if (current) out.push(current);
		if (out.length > 1) return out;
	}

	// Hard character split as last resort (avoid mid-word when possible).
	return hardSplitByChars(unit, FALLBACK_CHUNK_CHARS);
}

async function measureUsage(
	summarizer: Summarizer,
	text: string,
	options: { context?: string; signal?: AbortSignal }
): Promise<number> {
	try {
		return await summarizer.measureInputUsage(text, {
			context: options.context,
			signal: options.signal
		});
	} catch {
		return text.length;
	}
}

function splitParagraphs(text: string): string[] {
	const parts = text
		.split(/\n\s*\n+/)
		.map((p) => p.trim())
		.filter(Boolean);
	return parts.length > 0 ? parts : [text.trim()].filter(Boolean);
}

function splitSentences(text: string): string[] {
	const parts = text
		.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÄÖÜÑ0-9"'(])/u)
		.map((s) => s.trim())
		.filter(Boolean);
	return parts.length > 0 ? parts : [text.trim()].filter(Boolean);
}

function hardSplitByChars(text: string, maxChars: number): string[] {
	const limit = Math.max(200, Math.floor(maxChars));
	const out: string[] = [];
	let rest = text.trim();
	while (rest.length > limit) {
		let cut = rest.lastIndexOf(' ', limit);
		if (cut < Math.floor(limit * 0.5)) cut = limit;
		out.push(rest.slice(0, cut).trim());
		rest = rest.slice(cut).trim();
	}
	if (rest) out.push(rest);
	return out.length > 0 ? out : [text];
}

function throwIfAborted(signal?: AbortSignal): void {
	if (signal?.aborted) {
		const err = new DOMException('The operation was aborted.', 'AbortError');
		throw err;
	}
}
