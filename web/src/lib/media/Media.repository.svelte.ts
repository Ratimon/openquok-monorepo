import type { HttpGateway } from '$lib/core/HttpGateway';

export interface MediaConfig {
	endpoints: {
		list: string;
		download: string;
		upload: string;
		delete: string;
	};
}

/** Must match backend `MAX_MEDIA_UPLOAD_BYTES`. */
export const MAX_MEDIA_UPLOAD_BYTES = 50 * 1024 * 1024;

export interface MediaUploadResponseDto {
	success: boolean;
	data: {
		filePath: string;
		publicUrl?: string;
	};
	message: string;
}

export interface MediaProgrammerModel {
	blob: Blob;
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

/**
 * User-owned objects in R2 (composer attachments, etc.) via `/api/v1/media/*`.
 * Distinct from {@link ImageRepository} (Supabase Storage: avatars, blog_images).
 */
export class MediaRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: MediaConfig
	) {}

	public async getBlobByPath(params: { organizationId: string; id?: string; path?: string }): Promise<MediaProgrammerModel | null> {
		try {
			const sp = new URLSearchParams({ organizationId: params.organizationId });
			if (params.id) sp.set('id', params.id);
			if (!params.id && params.path) sp.set('path', params.path);
			const url = `${this.config.endpoints.download}?${sp.toString()}`;
			const { data, ok } = await this.httpGateway.get<Blob>(url, undefined, {
				responseType: 'blob',
				headers: { Accept: '*/*' }
			});

			if (!ok || !data) return null;
			return { blob: data };
		} catch {
			return null;
		}
	}

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
				message: `Media must be 50 MB or smaller (file is ${(file.size / (1024 * 1024)).toFixed(1)} MB).`
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
}
