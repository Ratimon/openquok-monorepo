const HTML_CONTENT_TYPE = 'text/html; charset=utf-8';

function isHtmlWithoutCharset(contentType: string): boolean {
	const normalized = contentType.toLowerCase();
	return normalized.startsWith('text/html') && !normalized.includes('charset');
}

/**
 * SvelteKit SSR may emit `content-type: text/html` without a charset. Align the HTTP
 * header with `<meta charset="utf-8">` in `app.html` so crawlers and browsers do not
 * mis-decode non-ASCII copy as Latin-1.
 *
 * Do not apply this during build/prerender (`building` in `hooks.server.ts`). Kit decides
 * HTML vs asset with an exact `content-type === 'text/html'` check; a charset parameter
 * causes extensionless prerender files that hosts may serve as downloads.
 */
export function ensureUtf8CharsetResponse(response: Response): Response {
	const contentType = response.headers.get('content-type');
	if (!contentType || !isHtmlWithoutCharset(contentType)) {
		return response;
	}

	const headers = new Headers(response.headers);
	headers.set('content-type', HTML_CONTENT_TYPE);

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
