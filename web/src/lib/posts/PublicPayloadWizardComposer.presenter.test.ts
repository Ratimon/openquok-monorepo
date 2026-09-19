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
});
