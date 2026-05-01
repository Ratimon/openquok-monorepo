import type {
	MediaDeleteProgrammerModel,
	MediaLibraryItemProgrammerModel,
	MediaListProgrammerModel,
	MediaRepository,
	SaveMediaInformationProgrammerModel,
	UploadSimpleProgrammerModel
} from '$lib/medias/Media.repository.svelte';

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

export class GetMediaPresenter {
	constructor(private readonly mediaRepository: MediaRepository) {}

	public async loadMediaLibraryListVm(
		organizationId: string,
		page: number,
		pageSize: number
	): Promise<MediaListViewModel> {
		const listPm = await this.mediaRepository.listMedia(organizationId, page, pageSize);
		return this.toMediaListVm(listPm);
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
