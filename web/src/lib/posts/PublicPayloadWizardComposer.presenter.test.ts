import { describe, expect, it } from 'vitest';

import { PublicPayloadWizardComposerPresenter } from '$lib/posts/PublicPayloadWizardComposer.presenter.svelte';
import { payloadWizardMockIntegrationId } from '$lib/posts/utils/buildPayloadWizardMockChannels';

describe('PublicPayloadWizardComposerPresenter', () => {
	it('preselects and focuses a platform channel in custom mode', () => {
		const presenter = new PublicPayloadWizardComposerPresenter({
			composerMode: 'custom',
			focusedProviderIdentifier: 'tiktok'
		});

		expect(presenter.mode).toBe('custom');
		expect(presenter.focusedIntegrationId).toBe(payloadWizardMockIntegrationId('tiktok'));
	});

	it('builds a programmatic payload preview with sample integration ids', () => {
		const presenter = new PublicPayloadWizardComposerPresenter();
		presenter.editorBody = '<p>Hello from the Payload Wizard</p>';
		presenter.selectedIds = [payloadWizardMockIntegrationId('x')];

		const result = presenter.getProgrammaticCreatePostPayloadPreview('scheduled');
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.payload.organizationId).toBeUndefined();
		expect(result.payload.integrationIds).toEqual([payloadWizardMockIntegrationId('x')]);
		expect(result.payload.body).toContain('Hello from the Payload Wizard');
		expect(result.payload.status).toBe('scheduled');
		expect(result.payload.scheduledAt).toBeTruthy();
	});

	it('does not pre-select media-required sample channels on guest landings', () => {
		const presenter = new PublicPayloadWizardComposerPresenter();

		expect(presenter.selectedIds).not.toContain(payloadWizardMockIntegrationId('tiktok'));
		expect(presenter.selectedIds).toContain(payloadWizardMockIntegrationId('facebook'));
	});

	it('builds live payload on guest hub defaults with text-only content', () => {
		const presenter = new PublicPayloadWizardComposerPresenter();
		presenter.editorBody = '<p>Hello from the posting API landing page</p>';

		const result = presenter.getProgrammaticCreatePostPayloadPreview('scheduled');
		expect(result.ok).toBe(true);
	});

	it('validates only the focused channel on platform payload wizard pages', () => {
		const presenter = new PublicPayloadWizardComposerPresenter({
			composerMode: 'custom',
			focusedProviderIdentifier: 'facebook'
		});
		presenter.editorBody = '<p>Hello Facebook</p>';

		const result = presenter.getProgrammaticCreatePostPayloadPreview('scheduled');
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.payload.integrationIds).toEqual([payloadWizardMockIntegrationId('facebook')]);
		expect(result.payload.isGlobal).toBe(false);
	});

	it('uses live editor media for schedule validation in global mode', () => {
		const presenter = new PublicPayloadWizardComposerPresenter();
		presenter.editorBody = '<p>Hello</p>';
		presenter.selectedIds = [payloadWizardMockIntegrationId('tiktok')];
		presenter.postMediaItemsVm = [{ id: 'media-1', path: 'uploads/photo.png' }];

		const result = presenter.getProgrammaticCreatePostPayloadPreview('scheduled');
		expect(result.ok).toBe(true);
		if (!result.ok) return;

		expect(result.payload.media?.length).toBe(1);
	});
});
