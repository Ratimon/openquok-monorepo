import { formatBenchmarkWindowsForSeo } from '$lib/best-time-to-post/utils/formatBenchmarkWindowsForSeo';

/** HTML table of Mon–Sun benchmark windows for platform-specific tool FAQs. */
export function buildBenchmarkFaqTableHtml(platformSlug: string): string {
	const benchmarkTableRows = formatBenchmarkWindowsForSeo(platformSlug);
	const body = benchmarkTableRows
		.map(
			(row) =>
				`<tr><td>${row.dayLabel}</td><td>${row.primaryTime}${
					row.secondaryTimes ? `, ${row.secondaryTimes}` : ''
				}</td></tr>`
		)
		.join('');

	return `<table><thead><tr><th>Day</th><th>Audience-local windows</th></tr></thead><tbody>${body}</tbody></table>`;
}
