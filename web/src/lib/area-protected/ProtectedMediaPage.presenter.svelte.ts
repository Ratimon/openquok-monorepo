import type { MediaRepository } from '$lib/medias/Media.repository.svelte';
import type {
	MediaDeleteProgrammerModel,
	MediaLibraryItemProgrammerModel,
	MediaListProgrammerModel,
	SaveMediaInformationProgrammerModel,
	UploadSimpleProgrammerModel
} from '$lib/medias/Media.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import { createRemotePagination } from '$lib/ui/helpers/createRemotePagination.svelte';

const DEFAULT_PAGE_SIZE = 24;

/**
 * Account media library: paginated list, settings modal, and mutations delegated to {@link MediaRepository}.
 */
export class ProtectedMediaPagePresenter {
	readonly pagination = createRemotePagination({ initialItemsPerPage: DEFAULT_PAGE_SIZE });

	items = $state<MediaLibraryItemProgrammerModel[]>([]);
	loading = $state(true);
	totalPages = $state(1);
	totalItems = $state(0);
	dragOver = $state(false);
	settingsOpen = $state(false);
	settingsItem = $state<MediaLibraryItemProgrammerModel | null>(null);

	private lastLoadedOrganizationId = $state('');

	constructor(
		private readonly mediaRepository: MediaRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter
	) {}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	openMediaSettings(entry: MediaLibraryItemProgrammerModel): void {
		this.settingsItem = entry;
		this.settingsOpen = true;
	}

	clearSettingsItem(): void {
		this.settingsItem = null;
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
				this.items = [];
				this.totalItems = 0;
				this.totalPages = 1;
				this.pagination.currentPage = 1;
				return;
			}
			const result: MediaListProgrammerModel = await this.mediaRepository.listMedia(
				organizationId,
				page,
				this.pagination.itemsPerPage
			);
			this.items = result.results;
			this.totalItems = result.total;
			this.totalPages = Math.max(result.pages, 1);
			this.pagination.currentPage = result.page;
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

	async deleteLibraryItem(item: MediaLibraryItemProgrammerModel): Promise<MediaDeleteProgrammerModel> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			return { success: false, message: 'Select a workspace first.' };
		}
		return this.mediaRepository.deleteMedia({ organizationId, id: item.id, path: item.path });
	}

	async uploadMediaSimple(params: {
		file: Blob;
		filename: string;
		preventSave: boolean;
	}): Promise<UploadSimpleProgrammerModel> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			return { success: false, message: 'Select a workspace first.' };
		}
		return this.mediaRepository.uploadMediaSimple({
			organizationId,
			file: params.file,
			filename: params.filename,
			preventSave: params.preventSave
		});
	}

	async saveMediaInformation(params: {
		id: string;
		alt: string | null;
		thumbnail: string | null;
		thumbnailTimestamp: number | null;
	}): Promise<SaveMediaInformationProgrammerModel> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			return { success: false, message: 'Select a workspace first.' };
		}
		return this.mediaRepository.saveMediaInformation({
			organizationId,
			id: params.id,
			alt: params.alt,
			thumbnail: params.thumbnail,
			thumbnailTimestamp: params.thumbnailTimestamp
		});
	}
}
