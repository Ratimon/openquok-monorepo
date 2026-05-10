import type { ApprovedAppsRepository, ApprovedAuthorizationProgrammerModel } from '$lib/settings/ApprovedApps.repository.svelte';

export enum ApprovedAppsSettingsStatus {
	IDLE = 'IDLE',
	LOADING = 'LOADING'
}

export type ApprovedAppRowViewModel = {
	authorizationId: string;
	appName: string;
	description: string | null;
	pictureUrl: string | null;
	authorizedOnLabel: string;
};

function toApprovedAppRowViewModel(pm: ApprovedAuthorizationProgrammerModel): ApprovedAppRowViewModel {
	const app = pm.oauthApp;
	const date = new Date(pm.createdAt);
	return {
		authorizationId: pm.id,
		appName: app?.name?.trim() ? app.name : 'Unknown app',
		description: app?.description ?? null,
		pictureUrl: app?.picturePublicUrl ?? app?.pictureThumbnailPublicUrl ?? null,
		authorizedOnLabel: Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
	};
}

export class ApprovedAppsSettingsPresenter {
	public status = $state<ApprovedAppsSettingsStatus>(ApprovedAppsSettingsStatus.IDLE);
	public itemsVm = $state<ApprovedAppRowViewModel[]>([]);
	public revokingAuthorizationId = $state<string | null>(null);
	public showToastMessage = $state(false);
	public toastMessage = $state('');
	public toastIsError = $state(false);

	constructor(private readonly approvedAppsRepository: ApprovedAppsRepository) {}

	public async load(): Promise<void> {
		this.status = ApprovedAppsSettingsStatus.LOADING;
		try {
			const listPm = await this.approvedAppsRepository.list();
			if (!listPm.ok) {
				this.itemsVm = [];
				this.toastMessage = listPm.message;
				this.toastIsError = true;
				this.showToastMessage = true;
				return;
			}
			this.itemsVm = listPm.items.map(toApprovedAppRowViewModel);
		} finally {
			this.status = ApprovedAppsSettingsStatus.IDLE;
		}
	}

	public async revoke(authorizationId: string): Promise<void> {
		this.revokingAuthorizationId = authorizationId;
		try {
			const revokePm = await this.approvedAppsRepository.revoke(authorizationId);
			if (!revokePm.ok) {
				this.toastMessage = revokePm.message;
				this.toastIsError = true;
				this.showToastMessage = true;
				return;
			}
			this.toastMessage = 'Access revoked.';
			this.toastIsError = false;
			this.showToastMessage = true;
			await this.load();
		} finally {
			this.revokingAuthorizationId = null;
		}
	}
}
