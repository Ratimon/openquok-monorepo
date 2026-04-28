import type { HttpGateway } from '$lib/core/HttpGateway';

/** Supabase Storage buckets exposed by `/api/v1/image/*`. */
export type DatabaseName = 'avatars' | 'blog_images';

export interface ImageUploadResponseDto {
	success: boolean;
	data: {
		filePath: string;
	};
	message: string;
}

export interface ImageProgrammerModel {
	blob: Blob;
}

export interface ImageUploadProgrammerModel {
	success: boolean;
	data: {
		filePath: string;
	};
	message: string;
}

export interface ImageDeleteResponseDto {
	success: boolean;
	message: string;
}

export interface ImageDeleteProgrammerModel {
	success: boolean;
	message: string;
}

export interface ImageConfig {
	endpoints: {
		getImageBlob: string;
		uploadImage: string;
		deleteImage: string;
		proxyImage: string;
		externalProxyImage: string;
	};
}

/** Max file size for upload (4MB). Vercel serverless body limit is 4.5MB; multipart overhead keeps us under. */
export const MAX_IMAGE_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Instagram `profile_picture_url` often resolves to `*.cdninstagram.com`, which may 403 when hotlinked.
 * Those URLs must be fetched via {@link ImageRepository.fetchExternalProxiedImageBlob} (authenticated).
 */
export function instagramProfilePictureNeedsAuthenticatedProxy(url: string): boolean {
	try {
		const u = new URL(url);
		return u.hostname === 'cdninstagram.com' || u.hostname.endsWith('.cdninstagram.com');
	} catch {
		return false;
	}
}

export class ImageRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: ImageConfig
	) {}

	public async getImageBlobByUrl(databaseName: DatabaseName, imageUrl: string): Promise<ImageProgrammerModel | null> {
		try {
			const params = new URLSearchParams({ databaseName, imageUrl });
			const { data, ok } = await this.httpGateway.get<Blob>(
				`${this.config.endpoints.getImageBlob}?${params.toString()}`,
				undefined,
				{
					responseType: 'blob',
					headers: { Accept: '*/*' }
				}
			);

			if (!ok || !data) return null;
			return { blob: data };
		} catch {
			return null;
		}
	}

	public async uploadImage(
		databaseName: DatabaseName,
		imageFile: File,
		uid: string
	): Promise<ImageUploadProgrammerModel> {
		if (imageFile.size > MAX_IMAGE_UPLOAD_BYTES) {
			return {
				success: false,
				data: { filePath: '' },
				message: `Image must be 4 MB or smaller (file is ${(imageFile.size / (1024 * 1024)).toFixed(1)} MB).`
			};
		}

		try {
			const formData = new FormData();
			formData.append('databaseName', databaseName);
			formData.append('imageFile', imageFile);
			// Backend uses JWT auth uid for the storage path (may differ from public.users.id from /me).
			formData.append('uid', uid);

			const { data: imageUploadDto, ok } = await this.httpGateway.post<ImageUploadResponseDto>(
				this.config.endpoints.uploadImage,
				formData,
				{ withCredentials: true }
			);

			if (ok && imageUploadDto?.data) {
				return { success: true, data: imageUploadDto.data, message: imageUploadDto.message };
			}

			return { success: false, data: { filePath: '' }, message: 'Error uploading image' };
		} catch (error) {
			return {
				success: false,
				data: { filePath: '' },
				message: error instanceof Error ? error.message : 'Error uploading image'
			};
		}
	}

	public async deleteImage(databaseName: DatabaseName, imagePath: string): Promise<ImageDeleteProgrammerModel> {
		try {
			const { data: deleteResponse, ok } = await this.httpGateway.delete<ImageDeleteResponseDto>(
				this.config.endpoints.deleteImage,
				{ data: { databaseName, imagePath } }
			);

			if (ok) return { success: true, message: deleteResponse.message };
			return { success: false, message: deleteResponse?.message || 'Error deleting image' };
		} catch (error) {
			return { success: false, message: error instanceof Error ? error.message : 'Error deleting image' };
		}
	}

	public async proxyImage(url: string): Promise<Blob | null> {
		try {
			const { data, ok } = await this.httpGateway.get<Blob>(this.config.endpoints.proxyImage, { url }, {
				responseType: 'blob',
				headers: { Accept: '*/*' }
			});

			if (!ok || !data) return null;
			return data;
		} catch {
			return null;
		}
	}

	/**
	 * Allowlisted CDN avatar proxy (`GET .../image/external-proxy`); requires Bearer auth via HttpGateway interceptors.
	 * (`/image/public-proxy` is a backwards-compatible alias.)
	 */
	public async fetchExternalProxiedImageBlob(remoteUrl: string): Promise<Blob | null> {
		try {
			const { data, ok } = await this.httpGateway.get<Blob>(
				this.config.endpoints.externalProxyImage,
				{ url: remoteUrl },
				{
					responseType: 'blob',
					headers: { Accept: '*/*' }
				}
			);

			if (!ok || !data) return null;
			return data;
		} catch {
			return null;
		}
	}
}
