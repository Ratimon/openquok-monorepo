import type {
	ConnectSocialSuccessProgrammerModel,
	IntegrationsRepository,
	SocialProviderIdentifier
} from '$lib/integrations/Integrations.repository.svelte';

/**
 * UI-facing result of completing social OAuth (navigation flags only; no raw API shape).
 */
export interface ContinueSocialIntegrationViewModel {
	organizationId: string;
	internalId: string;
	inBetweenSteps: boolean;
	onboarding: boolean;
}

function toContinueSocialIntegrationViewModel(
	pm: ConnectSocialSuccessProgrammerModel
): ContinueSocialIntegrationViewModel {
	return {
		organizationId: pm.organizationId,
		internalId: pm.internalId,
		inBetweenSteps: pm.inBetweenSteps,
		onboarding: pm.onboarding
	};
}

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
	}): Promise<
		{ ok: true; data: ContinueSocialIntegrationViewModel } | { ok: false; error: string }
	> {
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
			this.status = ContinueIntegrationStatus.SUCCESS;
			this.toastKind = 'success';
			this.toastMessage = resultPm.data.inBetweenSteps
				? 'One more step — finish connecting your channel.'
				: 'Channel added.';
			this.showToastMessage = true;
			return { ok: true, data: toContinueSocialIntegrationViewModel(resultPm.data) };
		}

		this.toastKind = 'error';
		this.toastMessage = resultPm.error;
		this.showToastMessage = true;
		this.status = ContinueIntegrationStatus.UNKNOWN;
		return { ok: false, error: resultPm.error };
	}
}
