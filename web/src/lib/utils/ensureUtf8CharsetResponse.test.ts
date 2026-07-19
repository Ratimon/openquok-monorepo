import { describe, expect, it } from 'vitest';

import { ensureUtf8CharsetResponse } from '$lib/utils/ensureUtf8CharsetResponse';

describe('ensureUtf8CharsetResponse', () => {
	it('adds charset=utf-8 when HTML responses omit it', () => {
		const response = new Response('<!doctype html><html></html>', {
			headers: { 'content-type': 'text/html' }
		});

		const updated = ensureUtf8CharsetResponse(response);

		expect(updated.headers.get('content-type')).toBe('text/html; charset=utf-8');
	});

	it('preserves an existing charset on HTML responses', () => {
		const response = new Response('<!doctype html><html></html>', {
			headers: { 'content-type': 'text/html; charset=utf-8' }
		});

		const updated = ensureUtf8CharsetResponse(response);

		expect(updated).toBe(response);
		expect(updated.headers.get('content-type')).toBe('text/html; charset=utf-8');
	});

	it('leaves non-HTML responses unchanged', () => {
		const response = new Response('{"ok":true}', {
			headers: { 'content-type': 'application/json' }
		});

		const updated = ensureUtf8CharsetResponse(response);

		expect(updated).toBe(response);
		expect(updated.headers.get('content-type')).toBe('application/json');
	});
});
