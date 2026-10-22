import { describe, expect, it } from 'vitest';

import { appendVisitorClientIpHeaders } from './visitorClientIpHeaders';

describe('appendVisitorClientIpHeaders', () => {
	it('never forwards cf-connecting-ip to the API', () => {
		const incoming = new Headers({
			'cf-connecting-ip': '203.0.113.10',
			'x-forwarded-for': '203.0.113.10'
		});
		const outgoing = new Headers({ 'cf-connecting-ip': '192.0.2.1' });

		appendVisitorClientIpHeaders(incoming, outgoing, '198.51.100.2');

		expect(outgoing.has('cf-connecting-ip')).toBe(false);
		expect(outgoing.get('x-forwarded-for')).toBe('203.0.113.10, 198.51.100.2');
	});

	it('sets x-forwarded-for from client address when absent', () => {
		const incoming = new Headers();
		const outgoing = new Headers();

		appendVisitorClientIpHeaders(incoming, outgoing, '198.51.100.2');

		expect(outgoing.has('cf-connecting-ip')).toBe(false);
		expect(outgoing.get('x-forwarded-for')).toBe('198.51.100.2');
	});

	it('uses cf-connecting-ip value only for x-forwarded-for when client address is missing', () => {
		const incoming = new Headers({ 'cf-connecting-ip': '203.0.113.10' });
		const outgoing = new Headers();

		appendVisitorClientIpHeaders(incoming, outgoing);

		expect(outgoing.has('cf-connecting-ip')).toBe(false);
		expect(outgoing.get('x-forwarded-for')).toBe('203.0.113.10');
	});
});
