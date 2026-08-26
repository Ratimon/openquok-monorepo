import { describe, expect, it } from 'vitest';

import { createHowToSEOSchema } from '$lib/seo/createHowToSEOSchema';

describe('createHowToSEOSchema', () => {
	it('returns HowTo with positioned steps', () => {
		const node = createHowToSEOSchema({
			canonicalUrl: 'https://www.openquok.com/docs/admin/oauth-server',
			name: 'Create an OAuth app',
			description: 'Register a third-party OAuth application.',
			steps: [
				{ name: 'Open developer settings', text: 'Go to Account → Settings → Developers → Apps.' },
				{ name: 'Create the app', text: 'Click Create OAuth app and fill the form.' }
			]
		});

		expect(node).toMatchObject({
			'@type': 'HowTo',
			'@id': 'https://www.openquok.com/docs/admin/oauth-server#howto',
			name: 'Create an OAuth app',
			description: 'Register a third-party OAuth application.',
			step: [
				{ '@type': 'HowToStep', position: 1, name: 'Open developer settings' },
				{ '@type': 'HowToStep', position: 2, name: 'Create the app' }
			]
		});
	});

	it('returns empty object when there are no valid steps', () => {
		expect(
			createHowToSEOSchema({
				canonicalUrl: 'https://example.com/docs',
				name: 'Example',
				steps: [{ name: 'Only name', text: '   ' }]
			})
		).toEqual({});
	});
});
