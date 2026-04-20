import type { HttpGateway } from '$lib/core/HttpGateway';
import { MAX_MEDIA_UPLOAD_BYTES, maxMediaUploadShortLabel } from 'openquok-common';

export interface MediaConfig {
	endpoints: {
		list: string;
		upload: string;
		delete: string;
		uploadSimple: string;
		saveInformation: string;
	};
}

export { MAX_MEDIA_UPLOAD_BYTES };

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

	public async uploadMedia(file: File, organizationId: string): Promise<MediaUploadProgrammerModel> {
		if (file.size > MAX_MEDIA_UPLOAD_BYTES) {
			return {
				success: false,
				data: { filePath: '' },
				message: `Media must be ${maxMediaUploadShortLabel()} or smaller (file is ${(file.size / (1024 * 1024)).toFixed(1)} MB).`
			};
		}

		try {
			const formData = new FormData();
			formData.append('mediaFile', file);
			formData.append('organizationId', organizationId);

			const { data: dto, ok } = await this.httpGateway.post<MediaUploadResponseDto>(
				this.config.endpoints.upload,
				formData,
				{ withCredentials: true }
			);

			if (ok && dto?.data) {
				return {
					success: true,
					data: { filePath: dto.data.filePath, ...(dto.data.publicUrl ? { publicUrl: dto.data.publicUrl } : {}) },
					message: dto.message
				};
			}
			return { success: false, data: { filePath: '' }, message: 'Error uploading media' };
		} catch (error) {
			return {
				success: false,
				data: { filePath: '' },
				message: error instanceof Error ? error.message : 'Error uploading media'
			};
		}
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
