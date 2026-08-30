import { describe, expect, it } from 'vitest';

import {
	OPENQUOK_GITHUB_REPO_HREF,
	PUBLIC_FAQ_ITEMS
} from '$lib/content/constants/publicFaqConfig';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';

describe('PUBLIC_FAQ_ITEMS', () => {
	it('keeps compare FAQ indexes stable', () => {
		expect(PUBLIC_FAQ_ITEMS[0]?.title).toBe('Why switch from Buffer or Hootsuite?');
		expect(PUBLIC_FAQ_ITEMS[1]?.title).toBe('Can I try OpenQuok for free?');
		expect(PUBLIC_FAQ_ITEMS[5]?.title).toBe("Why should I use OpenQuok's multi-workspace?");
	});

	it('links first-party docs, blog, compare, GitHub, and pricing in answers', () => {
		const html = PUBLIC_FAQ_ITEMS.map((item) => item.description).join('\n');
		expect(html).toContain('href="/compare/openquok/buffer"');
		expect(html).toContain(
			'href="/blog/best-buffer-alternatives-for-teams-that-approve-ai-content-before-posting"'
		);
		expect(html).toContain('href="/docs/getting-started-for-cli"');
		expect(html).toContain('href="/docs/agent-setup-guides"');
		expect(html).toContain('href="/docs/installation/docker-compose"');
		expect(html).toContain(`href="${OPENQUOK_GITHUB_REPO_HREF}"`);
		expect(html).toContain('href="/pricing"');
		expect(html).toContain('href="/docs/mcp-setup-guides"');
		expect(html).toContain('href="/channels"');
		expect(html).not.toContain('rel="nofollow"');
	});
});

describe('createPublicFaqSEOSchema', () => {
	it('stores FAQ answers as plain text while keeping link labels', () => {
		const schema = createPublicFaqSEOSchema({
			pageUrl: 'https://www.openquok.com/#faq',
			items: [
				{
					title: 'Can I self-host OpenQuok?',
					description: PUBLIC_FAQ_ITEMS.find((item) => item.title === 'Can I self-host OpenQuok?')
						?.description ?? ''
				}
			]
		});

		expect(schema['@type']).toBe('FAQPage');
		const answer = (schema.mainEntity as { acceptedAnswer: { text: string } }[])[0]
			?.acceptedAnswer.text;
		expect(answer).toContain('open source on GitHub');
		expect(answer).toContain('Docker Compose self-host guide');
		expect(answer).not.toContain('<a');
		expect(answer).not.toContain('href=');
	});
});
