import { describe, expect, it } from 'vitest';

import {
	findJsonLdGraphNodeByType,
	listJsonLdGraphNodeTypes
} from '$lib/seo/jsonLdSchema';
import { buildPublicToolPageJsonLdGraph } from '$lib/seo/tools/buildPublicToolPageJsonLdGraph';
import { PUBLIC_TOOL_FEATURE_LISTS } from '$lib/seo/tools/publicToolFeatureLists';
import { createBestTimeToPostHowToSchema } from '$lib/seo/tools/howTo/publicToolHowToSchemas';

describe('buildPublicToolPageJsonLdGraph', () => {
	it('includes WebApplication, FAQPage, HowTo, and BreadcrumbList', () => {
		const canonical = 'https://www.openquok.com/tools/best-time-to-post/bluesky';
		const graph = buildPublicToolPageJsonLdGraph({
			siteOrigin: 'https://www.openquok.com',
			webApp: {
				canonicalUrl: canonical,
				name: 'Best time to post on Bluesky',
				description: 'Test description',
				applicationCategory: 'BusinessApplication',
				siteOrigin: 'https://www.openquok.com',
				companyName: 'OpenQuok',
				featureList: PUBLIC_TOOL_FEATURE_LISTS.bestTimeToPost,
				aboutChannelLabel: 'Bluesky'
			},
			breadcrumbItems: [
				{ label: 'Free Tools', href: '/tools' },
				{ label: 'Best Time to Post', href: '/tools/best-time-to-post' },
				{ label: 'Bluesky' }
			],
			faqSection: {
				faqTitle: 'FAQ',
				faqDescription: 'Answers',
				faqItems: [{ title: 'Question?', description: 'Answer.' }]
			},
			additionalNodes: [
				createBestTimeToPostHowToSchema({ canonicalUrl: canonical, channelLabel: 'Bluesky' })
			]
		});

		const types = listJsonLdGraphNodeTypes(graph);
		expect(types).toContain('WebApplication');
		expect(types).toContain('FAQPage');
		expect(types).toContain('HowTo');
		expect(types).toContain('BreadcrumbList');

		const webApp = findJsonLdGraphNodeByType(graph, 'WebApplication');
		expect(webApp).toMatchObject({
			'@id': `${canonical}#webapp`,
			about: { '@type': 'Thing', name: 'Bluesky' }
		});
	});
});
