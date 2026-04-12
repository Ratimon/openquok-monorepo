import type {
	ConnectSocialSuccessProgrammerModel,
	InstagramBusinessConnectPageRow,
	IntegrationsRepository,
	SocialProviderIdentifier
} from '$lib/integrations/Integrations.repository.svelte';

/**
 * UI-facing result of completing social OAuth (navigation flags only; no raw API shape).
 */
export interface ContinueSocialIntegrationViewModel {
	/** Integration row id (UUID) — needed for Instagram (Business) account selection. */
	id: string;
	organizationId: string;
	internalId: string;
	inBetweenSteps: boolean;
	onboarding: boolean;
	/** Present when Instagram (Business) OAuth returned `pages` on the connect response. */
	instagramBusinessPages?: InstagramBusinessConnectPageRow[];
}

function toContinueSocialIntegrationViewModel(
	pm: ConnectSocialSuccessProgrammerModel
): ContinueSocialIntegrationViewModel {
	return {
		id: pm.id,
		organizationId: pm.organizationId,
		internalId: pm.internalId,
		inBetweenSteps: pm.inBetweenSteps,
		onboarding: pm.onboarding,
		...(Array.isArray(pm.pages) && pm.pages.length > 0 ? { instagramBusinessPages: pm.pages } : {})
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
