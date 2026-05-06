import type { OAuthAppsRepository, OauthAppProgrammerModel } from '$lib/developers/OAuthApps.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import type { GetMediaPresenter, MediaLibraryItemViewModel } from '$lib/medias/GetMedia.presenter.svelte';

export enum OAuthAppsPresenterStatus {
	IDLE = 'IDLE',
	LOADING = 'LOADING',
	MUTATING = 'MUTATING'
}

export type OauthAppViewModel = {
	id: string;
	organizationId: string;
	name: string;
	description: string | null;
	pictureId: string | null;
	redirectUrl: string;
	clientId: string;
	createdAt: string;
	updatedAt: string;
};

function toOauthAppVm(pm: OauthAppProgrammerModel): OauthAppViewModel {
	return {
		id: pm.id,
		organizationId: pm.organizationId,
		name: pm.name,
		description: pm.description,
		pictureId: pm.pictureId,
		redirectUrl: pm.redirectUrl,
		clientId: pm.clientId,
		createdAt: pm.createdAt,
		updatedAt: pm.updatedAt
	};
}

export class UpsertOAuthAppsPresenter {
	public status = $state<OAuthAppsPresenterStatus>(OAuthAppsPresenterStatus.IDLE);
	/** `undefined` until first load completes for the current workspace. */
	public appVm = $state<OauthAppViewModel | null | undefined>(undefined);
	public creating = $state(false);
	public editing = $state(false);

	public formName = $state('');
	public formDescription = $state('');
	public formRedirectUrl = $state('');
	public formPictureId = $state<string | null>(null);
	public formPicturePreviewUrl = $state<string | null>(null);

	public plaintextClientSecret = $state<string | null>(null);

	public showToastMessage = $state(false);
	public toastMessage = $state('');
	public toastIsError = $state(false);

	public mediaPickerOpen = $state(false);
	public mediaPickerLoading = $state(false);
	public mediaPickerItemsVm = $state<MediaLibraryItemViewModel[]>([]);

	public confirmRotateOpen = $state(false);
	public confirmDeleteOpen = $state(false);

	/** Set when GET /oauth-apps/app returns 403 (non-admin). */
	public loadForbidden = $state(false);
	public forbiddenMessage = $state('');

	private lastLoadedOrgId: string | null = null;

	constructor(
		private readonly oauthAppsRepository: OAuthAppsRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		private readonly getMediaPresenter: GetMediaPresenter
	) {}

	get currentOrganizationId(): string | null {
		return this.workspaceSettingsPresenter.currentWorkspaceId;
	}

	get canManageApps(): boolean {
		const role = this.workspaceSettingsPresenter.currentWorkspaceRole;
		return role === 'admin' || role === 'superadmin';
	}

	get isLoading(): boolean {
		return this.status === OAuthAppsPresenterStatus.LOADING;
	}

	public resetForms(): void {
		this.formName = '';
		this.formDescription = '';
		this.formRedirectUrl = '';
		this.formPictureId = null;
		this.formPicturePreviewUrl = null;
	}

	public startCreate(): void {
		this.resetForms();
		this.creating = true;
		this.editing = false;
		this.plaintextClientSecret = null;
	}

	public cancelCreate(): void {
		this.creating = false;
		this.resetForms();
	}

	public startEdit(): void {
		const app = this.appVm;
		if (!app) return;
		this.formName = app.name;
		this.formDescription = app.description ?? '';
		this.formRedirectUrl = app.redirectUrl;
		this.formPictureId = app.pictureId;
		this.formPicturePreviewUrl = null;
		this.editing = true;
	}

	public cancelEdit(): void {
		this.editing = false;
	}

	public async loadForCurrentWorkspace(): Promise<void> {
		const orgId = this.currentOrganizationId;
		if (!orgId) {
			this.appVm = undefined;
			return;
		}
		if (this.lastLoadedOrgId === orgId && this.appVm !== undefined) {
			return;
		}
		await this.load(orgId);
	}

	public async refresh(): Promise<void> {
		const orgId = this.currentOrganizationId;
		if (!orgId) return;
		this.lastLoadedOrgId = null;
		await this.load(orgId);
	}

	private async load(organizationId: string): Promise<void> {
		this.status = OAuthAppsPresenterStatus.LOADING;
		this.appVm = undefined;
		this.loadForbidden = false;
		this.forbiddenMessage = '';
		try {
			const resultPm = await this.oauthAppsRepository.getApp(organizationId);
			if (!resultPm.ok) {
				this.loadForbidden = true;
				this.forbiddenMessage = resultPm.message ?? 'Only workspace admins can manage OAuth apps.';
				this.appVm = null;
			} else {
				this.appVm = resultPm.appPm ? toOauthAppVm(resultPm.appPm) : null;
			}
			this.lastLoadedOrgId = organizationId;
		} finally {
			this.status = OAuthAppsPresenterStatus.IDLE;
		}
	}

	public async openMediaPicker(): Promise<void> {
		const orgId = this.currentOrganizationId;
		if (!orgId) return;
		this.mediaPickerOpen = true;
		this.mediaPickerLoading = true;
		this.mediaPickerItemsVm = [];
		try {
			const listVm = await this.getMediaPresenter.loadMediaLibraryListVm(orgId, 1, 60);
			this.mediaPickerItemsVm = listVm.results.filter((m) => m.kind === 'image');
		} finally {
			this.mediaPickerLoading = false;
		}
	}

	public selectMediaItem(vm: MediaLibraryItemViewModel): void {
		this.formPictureId = vm.id;
		this.formPicturePreviewUrl = vm.thumbnailPublicUrl ?? vm.publicUrl ?? vm.path ?? null;
		this.mediaPickerOpen = false;
	}

	public setMediaPickerOpen(open: boolean): void {
		this.mediaPickerOpen = open;
	}

	public clearPicture(): void {
		this.formPictureId = null;
		this.formPicturePreviewUrl = null;
	}

	private pushToast(message: string, isError: boolean): void {
		this.toastMessage = message;
		this.toastIsError = isError;
		this.showToastMessage = true;
	}

	public async submitCreate(): Promise<void> {
		const orgId = this.currentOrganizationId;
		if (!orgId || !this.canManageApps) {
			this.pushToast('Only workspace admins can manage OAuth apps.', true);
			return;
		}
		if (!this.formName.trim() || !this.formRedirectUrl.trim()) {
			this.pushToast('Name and redirect URL are required.', true);
			return;
		}
		this.status = OAuthAppsPresenterStatus.MUTATING;
		try {
			const resultPm = await this.oauthAppsRepository.createApp({
				organizationId: orgId,
				name: this.formName,
				description: this.formDescription.trim() || null,
				redirectUrl: this.formRedirectUrl,
				pictureId: this.formPictureId
			});
			if (!resultPm.ok) {
				this.pushToast(resultPm.message, true);
				return;
			}
			this.appVm = toOauthAppVm(resultPm.appPm);
			this.plaintextClientSecret = resultPm.clientSecret;
			this.creating = false;
			this.resetForms();
			this.pushToast('OAuth app created. Copy your client secret now — it is only shown once.', false);
		} finally {
			this.status = OAuthAppsPresenterStatus.IDLE;
		}
	}

	public async submitUpdate(): Promise<void> {
		const orgId = this.currentOrganizationId;
		const app = this.appVm;
		if (!orgId || !app || !this.canManageApps) {
			this.pushToast('Only workspace admins can manage OAuth apps.', true);
			return;
		}
		if (!this.formName.trim() || !this.formRedirectUrl.trim()) {
			this.pushToast('Name and redirect URL are required.', true);
			return;
		}
		this.status = OAuthAppsPresenterStatus.MUTATING;
		try {
			const resultPm = await this.oauthAppsRepository.updateApp({
				organizationId: orgId,
				oauthAppId: app.id,
				name: this.formName,
				description: this.formDescription.trim() || null,
				redirectUrl: this.formRedirectUrl,
				pictureId: this.formPictureId
			});
			if (!resultPm.ok) {
				this.pushToast(resultPm.message, true);
				return;
			}
			this.appVm = toOauthAppVm(resultPm.appPm);
			this.editing = false;
			this.pushToast('OAuth app updated.', false);
		} finally {
			this.status = OAuthAppsPresenterStatus.IDLE;
		}
	}

	public requestRotateSecret(): void {
		this.confirmRotateOpen = true;
	}

	public cancelRotateConfirm(): void {
		this.confirmRotateOpen = false;
	}

	public async confirmRotateSecret(): Promise<void> {
		this.confirmRotateOpen = false;
		const orgId = this.currentOrganizationId;
		const app = this.appVm;
		if (!orgId || !app || !this.canManageApps) return;
		this.status = OAuthAppsPresenterStatus.MUTATING;
		try {
			const resultPm = await this.oauthAppsRepository.rotateSecret(orgId, app.id);
			if (!resultPm.ok) {
				this.pushToast(resultPm.message, true);
				return;
			}
			this.plaintextClientSecret = resultPm.clientSecret;
			this.pushToast('Secret rotated. Copy your new client secret now.', false);
		} finally {
			this.status = OAuthAppsPresenterStatus.IDLE;
		}
	}

	public requestDeleteApp(): void {
		this.confirmDeleteOpen = true;
	}

	public cancelDeleteConfirm(): void {
		this.confirmDeleteOpen = false;
	}

	public async confirmDeleteApp(): Promise<void> {
		this.confirmDeleteOpen = false;
		const orgId = this.currentOrganizationId;
		const app = this.appVm;
		if (!orgId || !app || !this.canManageApps) return;
		this.status = OAuthAppsPresenterStatus.MUTATING;
		try {
			const resultPm = await this.oauthAppsRepository.deleteApp(orgId, app.id);
			if (!resultPm.ok) {
				this.pushToast(resultPm.message, true);
				return;
			}
			this.appVm = null;
			this.plaintextClientSecret = null;
			this.editing = false;
			this.creating = false;
			this.pushToast('OAuth app deleted.', false);
		} finally {
			this.status = OAuthAppsPresenterStatus.IDLE;
		}
	}

	/** Call when workspace switch might invalidate cached app. */
	public invalidateCache(): void {
		this.lastLoadedOrgId = null;
		this.appVm = undefined;
		this.loadForbidden = false;
		this.forbiddenMessage = '';
	}
}
