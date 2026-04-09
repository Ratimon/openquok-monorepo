import type { SocialProviderIdentifier } from '$lib/integrations/Integrations.repository.svelte';
import type { IntegrationsRepository } from '$lib/integrations/Integrations.repository.svelte';

export enum ContinueIntegrationStatus {
	UNKNOWN = 'unknown',
	SUBMITTING = 'submitting',
	SUCCESS = 'success'
}

export class ContinueIntegrationPresenter {
	status: ContinueIntegrationStatus = $state(ContinueIntegrationStatus.UNKNOWN);

	showToastMessage: boolean = $state(false);
	toastKind: 'success' | 'error' = $state('success');
	toastMessage: string = $state('');

	constructor(private readonly integrationsRepository: IntegrationsRepository) {}

	async continueSocialIntegration(params: {
		provider: SocialProviderIdentifier;
		code: string;
		state: string;
		timezone: string;
		refresh?: string;
	}): Promise<{ ok: true } | { ok: false }> {
		this.status = ContinueIntegrationStatus.SUBMITTING;
		this.showToastMessage = false;
		this.toastMessage = '';

		const resultPm = await this.integrationsRepository.connectSocial(params.provider, {
			code: params.code,
			state: params.state,
			timezone: params.timezone,
			...(params.refresh && { refresh: params.refresh })
		});

		if (resultPm.ok) {
			this.toastKind = 'success';
			this.toastMessage = 'Channel connected.';
			this.showToastMessage = true;
			this.status = ContinueIntegrationStatus.SUCCESS;
			return { ok: true };
		}

		this.toastKind = 'error';
		this.toastMessage = resultPm.error;
		this.showToastMessage = true;
		this.status = ContinueIntegrationStatus.UNKNOWN;
		return { ok: false };
	}
}

