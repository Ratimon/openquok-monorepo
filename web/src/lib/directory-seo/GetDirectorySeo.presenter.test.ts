import { describe, expect, it } from 'vitest';

import { GetDirectorySeoPresenter } from '$lib/directory-seo/GetDirectorySeo.presenter.svelte';
import type { DirectorySeoRepository } from '$lib/directory-seo/DirectorySeo.repository';

describe('GetDirectorySeoPresenter', () => {
	const presenter = new GetDirectorySeoPresenter({} as DirectorySeoRepository);

	it('buildRefreshControlsVm blocks refresh when website URL is missing', () => {
		const controls = presenter.buildRefreshControlsVm({
			overview: { providerConfigured: true, competitors: [], productDomain: null, manualRefreshAvailableAt: null },
			selectedProfileId: 'profile-1',
			missingWebsiteUrl: true,
			refreshing: false
		});

		expect(controls.canRefreshRatings).toBe(false);
		expect(controls.refreshButtonHint).toContain('website URL');
	});
});
