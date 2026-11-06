import { describe, expect, it } from 'vitest';

import { buildDirectoryChannelProcessSection } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelProcessSection';

describe('buildDirectoryChannelProcessSection', () => {
	it('starts with Chrome Web Store install before profile setup', () => {
		const section = buildDirectoryChannelProcessSection({
			channelSlug: 'peerpush',
			platformLabel: 'PeerPush',
			siteHost: 'peerpush.com',
			safariMockContentId: 'directory-site-peerpush',
			siteRulesStepContent: 'Rules copy.',
			launchOpportunityStepContent: 'Launch paths copy.',
			buildBacklinksSiteSlug: 'peerpush'
		});

		expect(section.steps).toHaveLength(6);
		expect(section.steps[0]?.title).toBe('Install the Chrome extension');
		expect(section.steps[0]?.deviceMockContent).toBe('chrome-web-store-openquok');
		expect(section.steps[0]?.mockLinkHref).toMatch(/^https:\/\/chromewebstore\.google\.com\//);
		expect(section.steps[1]?.title).toBe('Build one profile');
	});
});
