import type {
	MediaDeleteProgrammerModel,
	MediaLibraryItemProgrammerModel,
	MediaListProgrammerModel,
	MediaRepository,
	SaveMediaInformationProgrammerModel,
	UploadSimpleProgrammerModel
} from '$lib/medias/Media.repository.svelte';

import {
	MEDIA_VIRTUAL_GENERAL,
	MEDIA_VIRTUAL_POSTS,
	normalizeMediaVirtualPath
} from 'openquok-common';

import { collectFolderPathsFromTree } from '$lib/medias/utils/mediaVirtualFolderBrowse';

/** View model for a row / tile in the media library UI. */
export interface MediaLibraryItemViewModel {
	id: string;
	path: string;
	virtualPath?: string;
	name: string;
	size: number;
	lastModified: string | null;
	publicUrl?: string | null;
	kind: 'image' | 'video' | 'audio' | 'document' | 'other';
	alt?: string | null;
	thumbnail?: string | null;
	thumbnailPublicUrl?: string | null;
	thumbnailTimestamp?: number | null;
}

/** Paginated media library list for UI consumption (repository PM mapped to VMs). */
export interface MediaListViewModel {
	results: MediaLibraryItemViewModel[];
	total: number;
	pages: number;
	page: number;
	pageSize: number;
}

export interface MediaDeleteViewModel {
	success: boolean;
	message: string;
}

export type SaveMediaInformationViewModel =
	| { success: true; data: { id: string; path: string; publicUrl?: string | null } }
	| { success: false; message: string };

export type UploadSimpleViewModel =
	| { success: true; path: string; publicUrl?: string | null }
	| { success: false; message: string };

/** Images + folder paths for the composer media picker modal. */
export interface MediaPickerBrowseViewModel {
	images: MediaLibraryItemViewModel[];
	folderPaths: string[];
}

export class GetMediaPresenter {
	private static readonly PICKER_LIST_PAGE_SIZE = 100;

	constructor(private readonly mediaRepository: MediaRepository) {}

	public async loadMediaLibraryListVm(
		organizationId: string,
		page: number,
		pageSize: number
	): Promise<MediaListViewModel> {
		const listPm = await this.mediaRepository.listMedia(organizationId, page, pageSize);
		return this.toMediaListVm(listPm);
	}

	/** Tree + all image/video pages for folder browse/search in {@link MediaLibraryModal}. */
	public async loadMediaPickerBrowseVm(organizationId: string): Promise<MediaPickerBrowseViewModel> {
		const orgId = organizationId.trim();
		if (!orgId) {
			return { images: [], folderPaths: [MEDIA_VIRTUAL_GENERAL] };
		}

		const [treePm, images] = await Promise.all([
			this.mediaRepository.listMediaTree(orgId),
			this.loadAllPickerLibraryItemsVm(orgId)
		]);

		const fromTree = treePm ? collectFolderPathsFromTree(treePm.files) : [];
		const merged = new Set<string>([
			MEDIA_VIRTUAL_GENERAL,
			MEDIA_VIRTUAL_POSTS,
			...fromTree
		]);
		for (const item of images) {
			merged.add(normalizeMediaVirtualPath(item.virtualPath));
		}

		return {
			images,
			folderPaths: [...merged].sort((a, b) => a.localeCompare(b))
		};
	}

	private async loadAllPickerLibraryItemsVm(organizationId: string): Promise<MediaLibraryItemViewModel[]> {
		const pageSize = GetMediaPresenter.PICKER_LIST_PAGE_SIZE;
		const isPickerKind = (kind: MediaLibraryItemViewModel['kind']) =>
			kind === 'image' || kind === 'video';
		const first = await this.loadMediaLibraryListVm(organizationId, 1, pageSize);
		const rows = first.results.filter((m) => isPickerKind(m.kind));
		if (first.pages <= 1) return rows;

		const rest = await Promise.all(
			Array.from({ length: first.pages - 1 }, (_, index) =>
				this.loadMediaLibraryListVm(organizationId, index + 2, pageSize)
			)
		);
		for (const page of rest) {
			rows.push(...page.results.filter((m) => isPickerKind(m.kind)));
		}
		return rows;
	}

	public toMediaLibraryItemVm(pm: MediaLibraryItemProgrammerModel): MediaLibraryItemViewModel {
		return {
			id: pm.id,
			path: pm.path,
			virtualPath: pm.virtualPath,
			name: pm.name,
			size: pm.size,
			lastModified: pm.lastModified,
			publicUrl: pm.publicUrl,
			kind: pm.kind,
			alt: pm.alt,
			thumbnail: pm.thumbnail,
			thumbnailPublicUrl: pm.thumbnailPublicUrl,
			thumbnailTimestamp: pm.thumbnailTimestamp
		};
	}

	public toMediaLibraryItemsVm(pms: MediaLibraryItemProgrammerModel[]): MediaLibraryItemViewModel[] {
		return pms.map((pm) => this.toMediaLibraryItemVm(pm));
	}

	public toMediaListVm(listPm: MediaListProgrammerModel): MediaListViewModel {
		return {
			results: this.toMediaLibraryItemsVm(listPm.results),
			total: listPm.total,
			pages: listPm.pages,
			page: listPm.page,
			pageSize: listPm.pageSize
		};
	}

	public toMediaDeleteVm(pm: MediaDeleteProgrammerModel): MediaDeleteViewModel {
		return { success: pm.success, message: pm.message };
	}

	public toSaveMediaInformationVm(pm: SaveMediaInformationProgrammerModel): SaveMediaInformationViewModel {
		if (pm.success) {
			return { success: true, data: pm.data };
		}
		return { success: false, message: pm.message };
	}

	public toUploadSimpleVm(pm: UploadSimpleProgrammerModel): UploadSimpleViewModel {
		if (pm.success) {
			return {
				success: true,
				path: pm.path,
				publicUrl: pm.publicUrl
			};
		}
		return { success: false, message: pm.message };
	}
}
