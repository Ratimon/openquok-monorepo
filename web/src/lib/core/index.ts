import type { ImageConfig } from '$lib/core/Image.repository.svelte';

import { HttpGateway } from '$lib/core/HttpGateway';
import { ImageRepository } from '$lib/core/Image.repository.svelte';
import { DeleteImagePresenter } from '$lib/core/DeleteImage.presenter.svelte';
import { DownloadImagePresenter } from '$lib/core/DownloadImage.presenter.svelte';
import { SupabaseImageUploadAreaPresenter } from '$lib/core/SupabaseImageUploadArea.presenter.svelte';
import { UploadImagePresenter } from '$lib/core/UploadImage.presenter.svelte';
import { AvatarUploadPresenter } from '$lib/core/AvatarUpload.presenter.svelte';
import { CONFIG_SCHEMA_BACKEND } from '$lib/config/constants/config';

export const imageEndpoints = {
	getImageBlob: '/api/v1/image/download',
	uploadImage: '/api/v1/image/upload',
	deleteImage: '/api/v1/image/delete',
	proxyImage: '/api/v1/image/proxy',
	publicProxyImage: '/api/v1/image/public-proxy'
} as const;

const imageConfig: ImageConfig = { endpoints: imageEndpoints };

const httpGateway = new HttpGateway(CONFIG_SCHEMA_BACKEND.API_BASE_URL.default as string, {
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	}
});

export const imageRepository = new ImageRepository(httpGateway, imageConfig);

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
