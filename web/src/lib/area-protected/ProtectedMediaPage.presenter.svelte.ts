import type {
	GetMediaPresenter,
	MediaDeleteViewModel,
	MediaLibraryItemViewModel,
	SaveMediaInformationViewModel,
	UploadSimpleViewModel
} from '$lib/medias/GetMedia.presenter.svelte';
import type { MediaRepository } from '$lib/medias/Media.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import { createRemotePagination } from '$lib/ui/helpers/createRemotePagination.svelte';

const DEFAULT_PAGE_SIZE = 24;

/** Intersect with `protectedMediaPagePresenter` in routes when IDE TS omits `$state` fields on `.svelte.ts` presenters. */
export interface ProtectedMediaPagePresenterMediaSettingsVmPublic {
	settingsMediaVm: MediaLibraryItemViewModel | null;
}

/**
 * Account media library: list reads via {@link GetMediaPresenter}; mutations via {@link MediaRepository}.
 */
export class ProtectedMediaPagePresenter {
	readonly pagination = createRemotePagination({ initialItemsPerPage: DEFAULT_PAGE_SIZE });

	mediaItemsVm = $state<MediaLibraryItemViewModel[]>([]);
	loading = $state(true);
	totalPages = $state(1);
	totalItems = $state(0);
	dragOver = $state(false);
	settingsOpen = $state(false);
	settingsMediaVm = $state<MediaLibraryItemViewModel | null>(null);

	private lastLoadedOrganizationId = $state('');

	constructor(
		private readonly mediaRepository: MediaRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		private readonly getMediaPresenter: GetMediaPresenter
	) {}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	openMediaSettings(mediaVm: MediaLibraryItemViewModel): void {
		this.settingsMediaVm = mediaVm;
		this.settingsOpen = true;
	}

	clearSettingsMediaVm(): void {
		this.settingsMediaVm = null;
	}

	/**
	 * Run in `$effect`: when workspace id becomes available or changes, reset page and load.
	 */
	syncWorkspaceList(): void {
		const orgId = this.organizationId;
		if (!orgId) {
			this.lastLoadedOrganizationId = '';
			return;
		}
		if (orgId === this.lastLoadedOrganizationId) return;
		this.lastLoadedOrganizationId = orgId;
		this.pagination.resetToFirstPage();
		void this.loadMedia(1);
	}

	async loadMedia(page: number = this.pagination.currentPage): Promise<void> {
		this.loading = true;
		try {
			const organizationId = this.organizationId;
			if (!organizationId) {
				this.mediaItemsVm = [];
				this.totalItems = 0;
				this.totalPages = 1;
				this.pagination.currentPage = 1;
				return;
			}
			const listVm = await this.getMediaPresenter.loadMediaLibraryListVm(
				organizationId,
				page,
				this.pagination.itemsPerPage
			);
			this.mediaItemsVm = listVm.results;
			this.totalItems = listVm.total;
			this.totalPages = Math.max(listVm.pages, 1);
			this.pagination.currentPage = listVm.page;
		} finally {
			this.loading = false;
		}
	}

	setCurrentPage(page: number): void {
		if (page < 1 || page === this.pagination.currentPage) return;
		this.pagination.currentPage = page;
		void this.loadMedia(page);
	}

	setItemsPerPageAndReload(size: number): void {
		this.pagination.setItemsPerPage(size);
		void this.loadMedia(1);
	}

	paginateFrontFF(): void {
		const tp = Math.max(this.totalPages, 1);
		if (tp > 1) this.setCurrentPage(tp);
	}

	paginateBackFF(): void {
		this.setCurrentPage(1);
	}

	/** After new media is added (upload, design, etc.): show the first page and refetch. */
	reloadFromFirstPage(): void {
		this.pagination.resetToFirstPage();
		void this.loadMedia(1);
	}

	onDesignAdded(): void {
		this.reloadFromFirstPage();
	}

	async deleteLibraryItem(mediaVm: MediaLibraryItemViewModel): Promise<MediaDeleteViewModel> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			return this.getMediaPresenter.toMediaDeleteVm({ success: false, message: 'Select a workspace first.' });
		}
		const pm = await this.mediaRepository.deleteMedia({ organizationId, id: mediaVm.id, path: mediaVm.path });
		return this.getMediaPresenter.toMediaDeleteVm(pm);
	}

	async uploadMediaSimple(params: {
		file: Blob;
		filename: string;
		preventSave: boolean;
	}): Promise<UploadSimpleViewModel> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			return this.getMediaPresenter.toUploadSimpleVm({ success: false, message: 'Select a workspace first.' });
		}
		const pm = await this.mediaRepository.uploadMediaSimple({
			organizationId,
			file: params.file,
			filename: params.filename,
			preventSave: params.preventSave
		});
		return this.getMediaPresenter.toUploadSimpleVm(pm);
	}

	async saveMediaInformation(params: {
		id: string;
		alt: string | null;
		thumbnail: string | null;
		thumbnailTimestamp: number | null;
	}): Promise<SaveMediaInformationViewModel> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			return this.getMediaPresenter.toSaveMediaInformationVm({
				success: false,
				message: 'Select a workspace first.'
			});
		}
		const pm = await this.mediaRepository.saveMediaInformation({
			organizationId,
			id: params.id,
			alt: params.alt,
			thumbnail: params.thumbnail,
			thumbnailTimestamp: params.thumbnailTimestamp
		});
		return this.getMediaPresenter.toSaveMediaInformationVm(pm);
	}
}

/** Media library UI boundary types (repository PM → VM via {@link GetMediaPresenter}). */
export type {
	MediaDeleteViewModel,
	MediaLibraryItemViewModel,
	MediaListViewModel,
	SaveMediaInformationViewModel,
	UploadSimpleViewModel
} from '$lib/medias/GetMedia.presenter.svelte';
