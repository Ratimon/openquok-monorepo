import { describe, expect, it } from 'vitest';

import type { PublicChannelLandingPageViewModel } from '$lib/content/constants/channels/catalog/types';

import { publicChannelSelectLabel } from '$lib/link-directory/utils/publicChannelSelectLabel';

function minimalChannel(overrides: Partial<PublicChannelLandingPageViewModel>): PublicChannelLandingPageViewModel {
	return {
		slug: 'test',
		platformId: 'test',
		platformLabel: 'Test',
		icon: 'Send',
		heroTitle: '',
		heroDescription: '',
		metaTitle: '',
		metaDescription: '',
		keywords: [],
		featureSections: [],
		audienceSubtitle: '',
		audienceTitle: '',
		audienceCards: [],
		faqSubtitle: '',
		faqTitle: '',
		faqDescription: '',
		faqItems: [],
		docsPath: '/docs',
		available: true,
		...overrides
	};
}

describe('publicChannelSelectLabel', () => {
	it('uses schedulePostSelectLabel when context is schedule_post', () => {
		const channel = minimalChannel({
			slug: 'reddit',
			platformLabel: 'Reddit',
			schedulePostSelectLabel: 'Schedule Reddit drafts — you submit on reddit.com when due',
			heroTitle: 'Draft in OpenQuok\npost on reddit.com — lower ban risk'
		});
		expect(publicChannelSelectLabel(channel, { ctaKind: 'schedule_post' })).toBe(
			'Schedule Reddit drafts — you submit on reddit.com when due'
		);
	});

	it('uses first comma phrase for schedule_post when schedulePostSelectLabel is absent', () => {
		const channel = minimalChannel({
			slug: 'instagram',
			platformLabel: 'Instagram',
			heroTitle: 'Schedule Instagram feed posts, Reels, carousels, and Stories'
		});
		expect(publicChannelSelectLabel(channel, { ctaKind: 'schedule_post' })).toBe(
			'Schedule Instagram feed posts'
		);
	});

	it('normalizes newlines in heroTitle when no schedulePostSelectLabel', () => {
		const channel = minimalChannel({
			slug: 'reddit',
			platformLabel: 'Reddit',
			heroTitle: 'Draft in OpenQuok\npost on reddit.com — lower ban risk'
		});
		expect(publicChannelSelectLabel(channel)).toBe('Draft in OpenQuok post on reddit.com — lower ban risk');
	});
});
