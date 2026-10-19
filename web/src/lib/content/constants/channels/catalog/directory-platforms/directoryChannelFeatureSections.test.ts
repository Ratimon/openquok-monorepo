import { describe, expect, it } from 'vitest';

import { buildDirectoryChannelFeatureSections } from '$lib/content/constants/channels/catalog/directory-platforms/directoryChannelFeatureSections';

describe('buildDirectoryChannelFeatureSections', () => {
	it('returns three feature rows with directory bentos', () => {
		const sections = buildDirectoryChannelFeatureSections({
			platformLabel: 'PeerPush',
			discoveryFieldsLabel: 'PeerPush categories',
			autofillDescription: 'Variant line.'
		});

		expect(sections).toHaveLength(3);
		expect(sections.map((s) => s.bentoId)).toEqual([
			'directory-profile-cases',
			'directory-extension-autofill',
			'directory-track-status'
		]);
		expect(sections[0]?.subtitle).toBe('One business profile');
		expect(sections[1]?.title).toContain('PeerPush');
		expect(sections[2]?.description).toContain('PeerPush');
	});
});
