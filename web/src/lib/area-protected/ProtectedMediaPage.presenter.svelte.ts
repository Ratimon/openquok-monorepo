import type {
	GetMediaPresenter,
	MediaDeleteViewModel,
	MediaLibraryItemViewModel,
	SaveMediaInformationViewModel,
	UploadSimpleViewModel
} from '$lib/medias/GetMedia.presenter.svelte';
import type {
	MediaFileTreeEntityProgrammerModel,
	MediaRepository,
	MediaTreeProgrammerModel
} from '$lib/medias/Media.repository.svelte';
import type { WorkspaceSettingsPresenter } from '$lib/settings/WorkspaceSettings.presenter.svelte';
import { createRemotePagination } from '$lib/ui/helpers/createRemotePagination.svelte';

import type {
	IApi,
	IEntity,
	IFileMenuOption,
	IParsedEntity,
	TContextMenuType
} from '@svar-ui/svelte-filemanager';

import {
	DEFAULT_MEDIA_STORAGE_QUOTA_BYTES,
	MEDIA_VIRTUAL_GENERAL,
	mediaFileManagerId,
	mediaVirtualPathFromFileManagerTarget,
	normalizeMediaVirtualPath,
	parseMediaFileManagerId,
	isMediaFileManagerFolderId
} from 'openquok-common';

export type MediaDeleteFilesResult = {
	filesDeleted: number;
	foldersDeleted: number;
	errors: string[];
};

const DEFAULT_PAGE_SIZE = 24;

/** Intersect with `protectedMediaPagePresenter` in routes when IDE TS omits `$state` fields on `.svelte.ts` presenters. */
export interface ProtectedMediaPagePresenterMediaSettingsVmPublic {
	settingsMediaVm: MediaLibraryItemViewModel | null;
}

export type MediaFileManagerDriveVm = { used: number; total: number };

function treeEntityToVm(row: MediaFileTreeEntityProgrammerModel): IEntity {
	return {
		id: row.id,
		type: row.type,
		...(row.name ? { name: row.name } : {}),
		...(row.size != null ? { size: row.size } : {}),
		...(row.date ? { date: new Date(row.date) } : {}),
		...(row.lazy ? { lazy: true } : {}),
		...(row.mediaId ? { mediaId: row.mediaId } : {}),
		...(row.displayName ? { displayName: row.displayName } : {}),
		...(row.publicUrl ? { publicUrl: row.publicUrl } : {}),
		...(row.kind ? { kind: row.kind } : {})
	};
}

function treeToVm(tree: MediaTreeProgrammerModel): { files: IEntity[]; drive: MediaFileManagerDriveVm } {
	return {
		files: tree.files.map(treeEntityToVm),
		drive: tree.drive
	};
}

/**
 * Account media library: SVAR File Manager tree + paginated gallery via {@link MediaRepository}.
 */
export class ProtectedMediaPagePresenter {
	readonly pagination = createRemotePagination({ initialItemsPerPage: DEFAULT_PAGE_SIZE });

	fileManagerData = $state<IEntity[]>([]);
	drive = $state<MediaFileManagerDriveVm>({ used: 0, total: DEFAULT_MEDIA_STORAGE_QUOTA_BYTES });
	loading = $state(true);
	mediaItemsVm = $state<MediaLibraryItemViewModel[]>([]);
	totalPages = $state(1);
	totalItems = $state(0);
	settingsOpen = $state(false);
	settingsMediaVm = $state<MediaLibraryItemViewModel | null>(null);
	/** Folder path for the next upload (from active File Manager panel). */
	uploadVirtualPath = $state(MEDIA_VIRTUAL_GENERAL);

	private fileManagerApiState = $state<IApi | null>(null);
	private pendingFileManagerPath = $state<string | null>(null);
	private mediaById = $state<Map<string, MediaLibraryItemViewModel>>(new Map());
	private lastLoadedOrganizationId = $state('');

	constructor(
		private readonly mediaRepository: MediaRepository,
		private readonly workspaceSettingsPresenter: WorkspaceSettingsPresenter,
		private readonly getMediaPresenter: GetMediaPresenter
	) {}

	get organizationId(): string {
		return this.workspaceSettingsPresenter.currentWorkspaceId ?? '';
	}

	get currentWorkspaceName(): string {
		const id = this.organizationId;
		if (!id) return 'Media';
		return this.workspaceSettingsPresenter.workspacesVm.find((w) => w.id === id)?.name ?? 'Media';
	}

	get fileManagerApi(): IApi | null {
		return this.fileManagerApiState;
	}

	/** Optimistically adjust workspace drive usage shown in the file manager (clamped to quota). */
	adjustDriveUsedBytes(delta: number): void {
		if (!delta) return;
		const { used, total } = this.drive;
		if (total < 1) return;
		this.drive = {
			used: Math.max(0, Math.min(total, used + delta)),
			total
		};
	}

	registerFileManagerApi(api: IApi): void {
		this.fileManagerApiState = api;
		this.syncUploadFolderFromApi();
		this.applyPendingFileManagerPath();
	}

	private applyPendingFileManagerPath(): void {
		const api = this.fileManagerApiState;
		const path = this.pendingFileManagerPath;
		if (!api || !path) return;
		try {
			api.exec('set-path', { id: path });
			this.pendingFileManagerPath = null;
		} catch {
			// ignore
		}
	}

	private focusFileManagerPath(path: string): void {
		const normalized = normalizeMediaVirtualPath(path);
		this.pendingFileManagerPath = normalized;
		this.applyPendingFileManagerPath();
	}

	private clearFileManagerSelection(): void {
		const api = this.fileManagerApiState;
		if (!api) return;
		try {
			api.exec('select-file', { id: '' });
		} catch {
			// ignore
		}
	}

	private syncUploadFolderFromApi(): void {
		const api = this.fileManagerApiState;
		if (!api) return;
		try {
			const state = api.getState();
			const panel = state.panels?.[state.activePanel ?? 0];
			const path = panel?.path;
			if (typeof path === 'string' && path.length > 0) {
				this.uploadVirtualPath = normalizeMediaVirtualPath(path);
			}
		} catch {
			// ignore
		}
	}

	openMediaSettings(mediaVm: MediaLibraryItemViewModel): void {
		this.settingsMediaVm = mediaVm;
		this.settingsOpen = true;
	}

	clearSettingsMediaVm(): void {
		this.settingsMediaVm = null;
	}

	openSettingsForFileManagerId(fileManagerId: string): boolean {
		const parsed = parseMediaFileManagerId(fileManagerId);
		if (!parsed) return false;
		const vm = this.mediaById.get(parsed.mediaId);
		if (!vm) return false;
		this.openMediaSettings(vm);
		return true;
	}

	/**
	 * Run in `$effect`: when workspace id becomes available or changes, reload tree and gallery list.
	 */
	syncWorkspaceList(): void {
		const orgId = this.organizationId;
		if (!orgId) {
			this.lastLoadedOrganizationId = '';
			this.fileManagerData = [];
			this.mediaById = new Map();
			this.mediaItemsVm = [];
			this.totalItems = 0;
			this.totalPages = 1;
			this.pagination.resetToFirstPage();
			this.drive = { used: 0, total: DEFAULT_MEDIA_STORAGE_QUOTA_BYTES };
			return;
		}
		if (orgId === this.lastLoadedOrganizationId) return;
		this.lastLoadedOrganizationId = orgId;
		this.uploadVirtualPath = MEDIA_VIRTUAL_GENERAL;
		this.pagination.resetToFirstPage();
		void this.loadTree();
		void this.loadMedia(1);
	}

	async loadTree(): Promise<void> {
		this.clearFileManagerSelection();
		this.loading = true;
		try {
			const organizationId = this.organizationId;
			if (!organizationId) {
				this.fileManagerData = [];
				this.mediaById = new Map();
				return;
			}

			const treePm = await this.mediaRepository.listMediaTree(organizationId);
			if (!treePm) {
				this.fileManagerData = [];
				this.mediaById = new Map();
				return;
			}

			const { files, drive } = treeToVm(treePm);
			this.fileManagerData = files;
			this.drive = drive;

			const listPm = await this.mediaRepository.listMedia(organizationId, 1, 500);
			const map = new Map<string, MediaLibraryItemViewModel>();
			for (const row of listPm.results) {
				map.set(row.id, this.getMediaPresenter.toMediaLibraryItemVm(row));
			}
			this.mediaById = map;
		} finally {
			this.loading = false;
		}
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

	reloadFromFirstPage(): void {
		this.pagination.resetToFirstPage();
		void this.loadTree();
		void this.loadMedia(1);
	}

	onDesignAdded(): void {
		this.reloadFromFirstPage();
	}

	onFileManagerPathChanged(): void {
		this.syncUploadFolderFromApi();
	}

	buildMenuOptions(
		defaultOptions: IFileMenuOption[],
		mode: TContextMenuType,
		item?: IParsedEntity
	): IFileMenuOption[] {
		const blocked = new Set(['create-file', 'add-file']);
		let options = defaultOptions.filter((opt) => !blocked.has(String(opt.id ?? '')));

		if (mode === 'file' && item?.type === 'file') {
			const parsed = parseMediaFileManagerId(String(item.id ?? ''));
			if (parsed && this.mediaById.has(parsed.mediaId)) {
				const fileManagerId = String(item.id ?? '');
				options = [
					...options,
					{
						id: 'media-settings',
						text: 'Media settings',
						hotkey: '',
						handler: () => {
							this.openSettingsForFileManagerId(fileManagerId);
						}
					}
				];
			}
		}

		return options;
	}

	async handleDeleteFiles(ids: string[]): Promise<MediaDeleteFilesResult> {
		const organizationId = this.organizationId;
		if (!organizationId) {
			return { filesDeleted: 0, foldersDeleted: 0, errors: ['Select a workspace first.'] };
		}

		let filesDeleted = 0;
		let foldersDeleted = 0;
		const errors: string[] = [];

		for (const fileManagerId of ids) {
			if (isMediaFileManagerFolderId(fileManagerId)) {
				const path = mediaVirtualPathFromFileManagerTarget(fileManagerId);
				const result = await this.mediaRepository.deleteVirtualFolder({ organizationId, path });
				if (result.success) {
					foldersDeleted += 1;
				} else {
					errors.push(result.message);
				}
				continue;
			}

			const parsed = parseMediaFileManagerId(fileManagerId);
			if (!parsed) {
				errors.push('Could not delete this item.');
				continue;
			}
			const vm = this.mediaById.get(parsed.mediaId);
			if (!vm) {
				errors.push('Could not delete this file.');
				continue;
			}
			const deleted = await this.deleteLibraryItem(vm);
			if (deleted.success) {
				filesDeleted += 1;
			} else if (deleted.message) {
				errors.push(deleted.message);
			}
		}

		if (filesDeleted > 0 || foldersDeleted > 0) {
			await this.loadTree();
		}

		return { filesDeleted, foldersDeleted, errors };
	}

	async handleCopyFiles(ids: string[], target: string): Promise<boolean> {
		const organizationId = this.organizationId;
		if (!organizationId) return false;

		const targetPath = mediaVirtualPathFromFileManagerTarget(target);
		const result = await this.mediaRepository.copyMedia({
			organizationId,
			ids,
			target: targetPath
		});
		if (result.success) {
			await this.loadTree();
		}
		return result.success;
	}

	async handleMoveFiles(ids: string[], target: string): Promise<boolean> {
		const organizationId = this.organizationId;
		if (!organizationId) return false;

		const targetPath = mediaVirtualPathFromFileManagerTarget(target);
		const result = await this.mediaRepository.moveMedia({
			organizationId,
			ids,
			target: targetPath
		});
		if (result.success) {
			await this.loadTree();
		}
		return result.success;
	}

	async createVirtualFolder(name: string, parentPath: string): Promise<boolean> {
		const organizationId = this.organizationId;
		if (!organizationId) return false;

		const trimmed = name.trim();
		if (!trimmed) return false;

		const parent = mediaVirtualPathFromFileManagerTarget(parentPath);

		const result = await this.mediaRepository.createVirtualFolder({
			organizationId,
			parent,
			name: trimmed
		});
		if (result.success) {
			await this.loadTree();
			this.focusFileManagerPath(parent);
		}
		return result.success;
	}

	async handleRenameFile(fileManagerId: string, name: string): Promise<boolean> {
		const organizationId = this.organizationId;
		if (!organizationId) return false;

		const parsed = parseMediaFileManagerId(fileManagerId);
		const result = await this.mediaRepository.renameMedia({
			organizationId,
			id: fileManagerId,
			name
		});
		if (result.success) {
			const nextId = parsed
				? mediaFileManagerId(parsed.virtualPath, parsed.mediaId, name)
				: null;
			await this.loadTree();
			if (nextId && this.fileManagerApiState) {
				try {
					this.fileManagerApiState.exec('select-file', { id: nextId });
				} catch {
					// ignore
				}
			}
		}
		return result.success;
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
