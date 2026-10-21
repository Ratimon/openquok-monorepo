import { describe, expect, it } from 'vitest';

import { buildDirectoryChannelFeatureSections } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelFeatureSections';
import { PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG } from '$lib/content/constants/marketing/directory-submission-landing';

describe('buildDirectoryChannelFeatureSections', () => {
	it('mirrors directory-submission-tool product feature copy', () => {
		const sections = buildDirectoryChannelFeatureSections({
			platformLabel: 'PeerPush',
			siteHost: 'peerpush.com',
			discoveryFieldsLabel: 'PeerPush categories',
			autofillDescription: 'Submit on peerpush.com when the form looks right.'
		});

		const product = PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG.productFeatureSections;

		expect(sections[0]?.title).toBe(product.feature1.title);
		expect(sections[1]?.title).toBe(product.feature2.title);
		expect(sections[2]?.title).toBe(product.feature3.title);
		expect(sections[3]?.title).toBe(product.feature4.title);
		expect(sections[4]?.title).toBe(product.feature5.title);
		expect(sections[1]?.sectionKind).toBe('team-hero');
	});
});
