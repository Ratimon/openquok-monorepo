import type { HttpGateway } from '$lib/core/HttpGateway';
import { uploadWorkspaceMediaFile, type MediaUploadProgress } from '$lib/medias/utils/workspaceMediaUpload';
import { validateMediaFileUploadSize } from 'openquok-common';

export interface MediaFileTreeEntityProgrammerModel {
	id: string;
	type: 'file' | 'folder';
	name?: string;
	size?: number;
	date?: string;
	lazy?: boolean;
	mediaId?: string;
	displayName?: string;
	publicUrl?: string | null;
	kind?: MediaLibraryItemProgrammerModel['kind'];
}

export interface MediaTreeProgrammerModel {
	files: MediaFileTreeEntityProgrammerModel[];
	drive: { used: number; total: number };
}

export interface MediaConfig {
	endpoints: {
		list: string;
		tree: string;
		upload: string;
		delete: string;
		move: string;
		copy: string;
		rename: string;
		createFolder: string;
		deleteFolder: string;
		uploadSimple: string;
		saveInformation: string;
	};
}

export { MAX_MEDIA_UPLOAD_BYTES, MAX_MEDIA_VIDEO_UPLOAD_BYTES } from 'openquok-common';

export interface MediaUploadResponseDto {
	success: boolean;
	data: {
		filePath: string;
		publicUrl?: string;
	};
	message: string;
}

export interface MediaUploadProgrammerModel {
	success: boolean;
	data: {
		filePath: string;
		publicUrl?: string;
	};
	message: string;
}

export interface MediaLibraryItemProgrammerModel {
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

export interface MediaListResponseDto {
	success: boolean;
	data?: {
		results?: MediaLibraryItemProgrammerModel[];
		total?: number;
		pages?: number;
		page?: number;
		pageSize?: number;
	};
}

export interface MediaListProgrammerModel {
	results: MediaLibraryItemProgrammerModel[];
	total: number;
	pages: number;
	page: number;
	pageSize: number;
}

export interface MediaDeleteResponseDto {
	success: boolean;
	message: string;
}

export interface MediaDeleteProgrammerModel {
	success: boolean;
	message: string;
}

export interface SaveMediaInformationResponseDto {
	success: boolean;
	data?: { id: string; path: string; publicUrl?: string | null };
	message?: string;
}

export interface UploadSimpleResponseDto {
	success: boolean;
	data?: { path?: string; filePath?: string; publicUrl?: string | null };
	message?: string;
}

export type SaveMediaInformationProgrammerModel =
	| { success: true; data: { id: string; path: string; publicUrl?: string | null } }
	| { success: false; message: string };

export type UploadSimpleProgrammerModel =
	| { success: true; path: string; publicUrl?: string | null }
	| { success: false; message: string };

/**
 * User-owned objects in R2 (composer attachments, etc.) via `/api/v1/media/*`.
 * Distinct from {@link ImageRepository} (Supabase Storage: avatars, blog_images).
 */
export class MediaRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: MediaConfig
	) {}

	public async listMedia(organizationId: string, page = 1, pageSize = 24): Promise<MediaListProgrammerModel> {
		try {
			const { data: dto, ok } = await this.httpGateway.get<MediaListResponseDto>(
				this.config.endpoints.list,
				{ organizationId, page, pageSize },
				{ withCredentials: true }
			);

			if (ok && dto?.data) {
				return {
					results: dto.data.results ?? [],
					total: dto.data.total ?? 0,
					pages: dto.data.pages ?? 1,
					page: dto.data.page ?? page,
					pageSize: dto.data.pageSize ?? pageSize
				};
			}

			return { results: [], total: 0, pages: 1, page, pageSize };
		} catch {
			return { results: [], total: 0, pages: 1, page, pageSize };
		}
	}

	public async listMediaTree(organizationId: string): Promise<MediaTreeProgrammerModel | null> {
		try {
			const { data: dto, ok } = await this.httpGateway.get<{
				success: boolean;
				data?: MediaTreeProgrammerModel;
			}>(this.config.endpoints.tree, { organizationId }, { withCredentials: true });

			if (ok && dto?.data) {
				return dto.data;
			}
			return null;
		} catch {
			return null;
		}
	}

	public async copyMedia(params: {
		organizationId: string;
		ids: string[];
		target: string;
	}): Promise<{ success: boolean; message: string; copied?: number }> {
		try {
			const { data: copyDto, ok } = await this.httpGateway.post<{
				success: boolean;
				data?: { copied?: number };
				message?: string;
			}>(
				this.config.endpoints.copy,
				{
					organizationId: params.organizationId,
					ids: params.ids,
					target: params.target
				},
				{ withCredentials: true }
			);

			if (ok && copyDto?.success) {
				return { success: true, message: 'Copied.', copied: copyDto.data?.copied };
			}
			return { success: false, message: copyDto?.message || 'Could not copy files.' };
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Could not copy files.'
			};
		}
	}

	public async moveMedia(params: {
		organizationId: string;
		ids: string[];
		target: string;
	}): Promise<{ success: boolean; message: string; moved?: number }> {
		try {
			const { data: moveDto, ok } = await this.httpGateway.post<{
				success: boolean;
				data?: { moved?: number };
				message?: string;
			}>(
				this.config.endpoints.move,
				{
					organizationId: params.organizationId,
					ids: params.ids,
					target: params.target
				},
				{ withCredentials: true }
			);

			if (ok && moveDto?.success) {
				return { success: true, message: 'Moved.', moved: moveDto.data?.moved };
			}
			return { success: false, message: moveDto?.message || 'Could not move files.' };
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Could not move files.'
			};
		}
	}

	public async deleteVirtualFolder(params: {
		organizationId: string;
		path: string;
	}): Promise<{ success: boolean; message: string }> {
		try {
			const { data: deleteDto, ok } = await this.httpGateway.delete<{
				success: boolean;
				message?: string;
			}>(this.config.endpoints.deleteFolder, {
				data: {
					organizationId: params.organizationId,
					path: params.path
				},
				withCredentials: true
			});

			if (ok && deleteDto?.success) {
				return { success: true, message: 'Folder deleted.' };
			}
			return { success: false, message: deleteDto?.message || 'Could not delete folder.' };
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Could not delete folder.'
			};
		}
	}

	public async createVirtualFolder(params: {
		organizationId: string;
		parent: string;
		name: string;
	}): Promise<{ success: boolean; message: string; path?: string }> {
		try {
			const { data: createDto, ok } = await this.httpGateway.post<{
				success: boolean;
				data?: { path?: string };
				message?: string;
			}>(
				this.config.endpoints.createFolder,
				{
					organizationId: params.organizationId,
					parent: params.parent,
					name: params.name
				},
				{ withCredentials: true }
			);

			if (ok && createDto?.success) {
				return { success: true, message: 'Folder created.', path: createDto.data?.path };
			}
			return { success: false, message: createDto?.message || 'Could not create folder.' };
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Could not create folder.'
			};
		}
	}

	public async renameMedia(params: {
		organizationId: string;
		id: string;
		name: string;
	}): Promise<{ success: boolean; message: string }> {
		try {
			const { data: renameDto, ok } = await this.httpGateway.post<{ success: boolean; message?: string }>(
				this.config.endpoints.rename,
				{
					organizationId: params.organizationId,
					id: params.id,
					name: params.name
				},
				{ withCredentials: true }
			);

			if (ok && renameDto?.success) {
				return { success: true, message: 'Renamed.' };
			}
			return { success: false, message: renameDto?.message || 'Could not rename file.' };
		} catch (error) {
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Could not rename file.'
			};
		}
	}

	public async uploadMedia(
		file: File,
		organizationId: string,
		virtualPath?: string,
		options?: { onProgress?: (progress: MediaUploadProgress) => void }
	): Promise<MediaUploadProgrammerModel> {
		const sizeError = validateMediaFileUploadSize(file.size, file.type, 'frontend');
		if (sizeError) {
			return { success: false, data: { filePath: '' }, message: sizeError };
		}

		return uploadWorkspaceMediaFile({
			file,
			organizationId,
			virtualPath,
			onProgress: options?.onProgress
		});
	}

	public async deleteMedia(params: { organizationId: string; id?: string; path?: string }): Promise<MediaDeleteProgrammerModel> {
		try {
			const { data: deleteResponse, ok } = await this.httpGateway.delete<MediaDeleteResponseDto>(
				this.config.endpoints.delete,
				{ data: { organizationId: params.organizationId, ...(params.id ? { id: params.id } : {}), ...(params.path ? { path: params.path } : {}) }, withCredentials: true }
			);

			if (ok) return { success: true, message: deleteResponse.message };
			return { success: false, message: deleteResponse?.message || 'Error deleting media' };
		} catch (error) {
			return { success: false, message: error instanceof Error ? error.message : 'Error deleting media' };
		}
	}

	public async saveMediaInformation(params: {
		organizationId: string;
		id: string;
		alt?: string | null;
		thumbnail?: string | null;
		thumbnailTimestamp?: number | null;
	}): Promise<SaveMediaInformationProgrammerModel> {
		try {
			const { data: saveDto, ok } = await this.httpGateway.post<SaveMediaInformationResponseDto>(
				this.config.endpoints.saveInformation,
				{
					organizationId: params.organizationId,
					id: params.id,
					alt: params.alt,
					thumbnail: params.thumbnail,
					thumbnailTimestamp: params.thumbnailTimestamp
				},
				{ withCredentials: true }
			);

			if (ok && saveDto?.success && saveDto.data) {
				return { success: true, data: saveDto.data };
			}
			return { success: false, message: saveDto?.message || 'Could not save media details.' };
		} catch (error) {
			return { success: false, message: error instanceof Error ? error.message : 'Could not save media details.' };
		}
	}

	public async uploadMediaSimple(params: {
		organizationId: string;
		file: File | Blob;
		filename: string;
		preventSave: boolean;
	}): Promise<UploadSimpleProgrammerModel> {
		const mime =
			params.file instanceof File
				? params.file.type
				: params.filename.toLowerCase().endsWith('.mp4')
					? 'video/mp4'
					: 'image/png';
		const sizeError = validateMediaFileUploadSize(params.file.size, mime, 'frontend');
		if (sizeError) {
			return { success: false, message: sizeError };
		}

		try {
			const formData = new FormData();
			formData.append('file', params.file, params.filename);
			formData.append('organizationId', params.organizationId);
			formData.append('preventSave', params.preventSave ? 'true' : 'false');

			const { data: uploadDto, ok } = await this.httpGateway.post<UploadSimpleResponseDto>(
				this.config.endpoints.uploadSimple,
				formData,
				{ withCredentials: true }
			);

			if (ok && uploadDto?.success && uploadDto.data) {
				const path = uploadDto.data.path ?? uploadDto.data.filePath ?? '';
				if (!path) return { success: false, message: 'Upload did not return a path.' };
				return { success: true, path, publicUrl: uploadDto.data.publicUrl ?? undefined };
			}
			return { success: false, message: uploadDto?.message || 'Upload failed.' };
		} catch (error) {
			return { success: false, message: error instanceof Error ? error.message : 'Upload failed.' };
		}
	}
}
