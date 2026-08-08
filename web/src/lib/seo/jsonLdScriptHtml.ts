/** Safe JSON-LD payload for {@html} injection in `<svelte:head>`. */
export function serializeJsonLd(data: unknown): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function jsonLdScriptHtml(data: unknown): string {
	return `<script type="application/ld+json">${serializeJsonLd(data)}<\/script>`;
}
