/** Query string for docs redirects; empty during prerender (`url.search` throws). */
export function docsUrlSearch(url: URL): string {
	try {
		return url.search;
	} catch {
		return '';
	}
}
