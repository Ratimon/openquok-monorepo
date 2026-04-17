import type { ImageConfig } from '$lib/core/Image.repository.svelte';
import type { MediaConfig } from '$lib/core/Media.repository.svelte';

import { HttpGateway } from '$lib/core/HttpGateway';
import { ImageRepository } from '$lib/core/Image.repository.svelte';
import { MediaRepository } from '$lib/core/Media.repository.svelte';
import { DeleteImagePresenter } from '$lib/core/DeleteImage.presenter.svelte';
import { DownloadImagePresenter } from '$lib/core/DownloadImage.presenter.svelte';
import { SupabaseImageUploadAreaPresenter } from '$lib/core/SupabaseImageUploadArea.presenter.svelte';
import { UploadImagePresenter } from '$lib/core/UploadImage.presenter.svelte';
import { AvatarUploadPresenter } from '$lib/core/AvatarUpload.presenter.svelte';
import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';

const imageConfig: ImageConfig = {
	endpoints: {
		getImageBlob: '/api/v1/image/download',
		uploadImage: '/api/v1/image/upload',
		deleteImage: '/api/v1/image/delete',
		proxyImage: '/api/v1/image/proxy'
	}
};

const mediaConfig: MediaConfig = {
	endpoints: {
		list: '/api/v1/media',
		download: '/api/v1/media/download',
		upload: '/api/v1/media/upload',
		delete: '/api/v1/media/delete'
	}
};

const httpGateway = new HttpGateway(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default as string, {
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	}
});

export const imageRepository = new ImageRepository(httpGateway, imageConfig);
export const mediaRepository = new MediaRepository(httpGateway, mediaConfig);

// Upload Area Presenters (singletons)
const downloadImageUploadAreaPresenter = new DownloadImagePresenter(imageRepository);
const uploadImageUploadAreaPresenter = new UploadImagePresenter(imageRepository);
const deleteImageUploadAreaPresenter = new DeleteImagePresenter(imageRepository);

/** Dedicated presenters for account avatar (avoid sharing VM state with blog image upload). */
const downloadAvatarPresenter = new DownloadImagePresenter(imageRepository);
const uploadAvatarPresenter = new UploadImagePresenter(imageRepository);
const deleteAvatarPresenter = new DeleteImagePresenter(imageRepository);

export const avatarUploadPresenter = new AvatarUploadPresenter(
	downloadAvatarPresenter,
	uploadAvatarPresenter
);
export const avatarDeletePresenter = deleteAvatarPresenter;

export const blogHeroImageUploadAreaPresenter = new SupabaseImageUploadAreaPresenter(
	downloadImageUploadAreaPresenter,
	uploadImageUploadAreaPresenter,
	deleteImageUploadAreaPresenter,
);

export { httpGateway };
export { HttpGateway, ApiError, type ApiRequestOptions, type ApiResponse } from '$lib/core/HttpGateway';
