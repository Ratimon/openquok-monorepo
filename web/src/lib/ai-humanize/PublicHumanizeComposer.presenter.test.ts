import { describe, expect, it } from 'vitest';

import { PublicHumanizeComposerPresenter } from '$lib/ai-humanize/PublicHumanizeComposer.presenter.svelte';
import { humanizeMockChannelId } from '$lib/ai-humanize/utils/buildHumanizeMockChannels';

describe('PublicHumanizeComposerPresenter.applyPageChannel', () => {
	it('starts in Global Edit with every catalog mock selected', () => {
		const composer = new PublicHumanizeComposerPresenter();
		expect(composer.mode).toBe('global');
		expect(composer.focusedIntegrationId).toBeNull();
		expect(composer.selectedIds.length).toBe(composer.baseSocialChannelsVm.length);
		expect(composer.selectedIds.length).toBeGreaterThan(0);
	});

	it('preselects and focuses a coming-soon catalog mock on a channel page', () => {
		const composer = new PublicHumanizeComposerPresenter({
			composerMode: 'custom',
			focusedProviderIdentifier: 'facebook'
		});
		expect(composer.mode).toBe('custom');
		expect(composer.focusedIntegrationId).toBe(humanizeMockChannelId('facebook'));
		expect(composer.focusedProviderIdentifier).toBe('facebook');
		expect(composer.selectedIds).toContain(humanizeMockChannelId('facebook'));
	});

	it('preselects and focuses the matching mock on a channel page', () => {
		const composer = new PublicHumanizeComposerPresenter({
			composerMode: 'custom',
			focusedProviderIdentifier: 'linkedin'
		});
		expect(composer.mode).toBe('custom');
		expect(composer.focusedIntegrationId).toBe(humanizeMockChannelId('linkedin'));
		expect(composer.focusedProviderIdentifier).toBe('linkedin');
		expect(composer.selectedIds).toContain(humanizeMockChannelId('linkedin'));
		expect(composer.selectedIds.length).toBe(composer.baseSocialChannelsVm.length);
	});

	it('returns to Global Edit when the page has no focused channel', () => {
		const composer = new PublicHumanizeComposerPresenter({
			composerMode: 'custom',
			focusedProviderIdentifier: 'x'
		});
		composer.applyPageChannel({ composerMode: 'global', focusedProviderIdentifier: null });
		expect(composer.mode).toBe('global');
		expect(composer.focusedIntegrationId).toBeNull();
	});
});
