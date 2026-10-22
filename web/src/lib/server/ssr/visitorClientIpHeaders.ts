/**
 * Forward the browser visitor IP to the backend during SSR API fetches so
 * `publicRead` rate limits key per visitor, not per web-server egress IP.
 *
 * Do not forward `CF-Connecting-IP`: the API host sits behind Cloudflare and
 * rejects that header when the TCP client is not the edge (e.g. Vercel SSR).
 * Use `X-Forwarded-For` only; the API trusts the leftmost hop when CF is absent.
 */
export function appendVisitorClientIpHeaders(
	incomingRequestHeaders: Headers,
	outgoingHeaders: Headers,
	clientAddress?: string
): void {
	outgoingHeaders.delete('cf-connecting-ip');

	const visitorFromCf = incomingRequestHeaders.get('cf-connecting-ip')?.trim();
	const prior =
		outgoingHeaders.get('x-forwarded-for')?.trim() ||
		incomingRequestHeaders.get('x-forwarded-for')?.trim() ||
		'';

	if (clientAddress?.trim()) {
		outgoingHeaders.set(
			'x-forwarded-for',
			prior ? `${prior}, ${clientAddress.trim()}` : clientAddress.trim()
		);
		return;
	}

	if (visitorFromCf && !outgoingHeaders.has('x-forwarded-for')) {
		outgoingHeaders.set('x-forwarded-for', prior ? `${visitorFromCf}, ${prior}` : visitorFromCf);
		return;
	}

	if (prior && !outgoingHeaders.has('x-forwarded-for')) {
		outgoingHeaders.set('x-forwarded-for', prior);
	}
}
