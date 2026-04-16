import type { HttpGateway } from '$lib/core/HttpGateway';

export interface MediaConfig {
	endpoints: {
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

	public async getBlobByPath(storagePath: string): Promise<MediaProgrammerModel | null> {
		try {
			const url = `${this.config.endpoints.download}?${new URLSearchParams({ path: storagePath }).toString()}`;
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

	public async uploadMedia(file: File, uid: string): Promise<MediaUploadProgrammerModel> {
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
			formData.append('uid', uid);

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

	public async deleteMedia(storagePath: string): Promise<MediaDeleteProgrammerModel> {
		try {
			const { data: deleteResponse, ok } = await this.httpGateway.delete<MediaDeleteResponseDto>(
				this.config.endpoints.delete,
				{ data: { path: storagePath } }
			);

			if (ok) return { success: true, message: deleteResponse.message };
			return { success: false, message: deleteResponse?.message || 'Error deleting media' };
		} catch (error) {
			return { success: false, message: error instanceof Error ? error.message : 'Error deleting media' };
		}
	}
}
