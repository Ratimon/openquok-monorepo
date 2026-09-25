import { describe, expect, it } from 'vitest';

import { normalizeDocPageRef } from './normalizeDocPageRef';

describe('normalizeDocPageRef', () => {
	it('accepts bare slugs', () => {
		expect(normalizeDocPageRef('getting-started-for-mcp/setup')).toEqual({
			slug: 'getting-started-for-mcp/setup'
		});
	});

	it('strips /docs prefix and trailing /markdown', () => {
		expect(normalizeDocPageRef('/docs/getting-started-for-mcp/setup/markdown')).toEqual({
			slug: 'getting-started-for-mcp/setup'
		});
	});

	it('parses absolute doc URLs', () => {
		expect(
			normalizeDocPageRef('https://www.openquok.com/docs/getting-started-for-mcp/setup')
		).toEqual({ slug: 'getting-started-for-mcp/setup' });
	});

	it('extracts non-default locale prefix', () => {
		expect(normalizeDocPageRef('/docs/es/getting-started-for-dev')).toEqual({
			slug: 'getting-started-for-dev',
			locale: 'es'
		});
	});

	it('maps /docs hub to empty slug', () => {
		expect(normalizeDocPageRef('/docs')).toEqual({ slug: '' });
	});
});
