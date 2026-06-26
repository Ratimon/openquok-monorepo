import type { MediaConfig } from './Media.repository.svelte';
import { httpGateway } from '$lib/core/index';
import { GetMediaPresenter } from './GetMedia.presenter.svelte';
import { MediaRepository } from './Media.repository.svelte';

const mediaConfig: MediaConfig = {
	endpoints: {
		list: '/api/v1/media',
		tree: '/api/v1/media/tree',
		upload: '/api/v1/media/upload',
		delete: '/api/v1/media/delete',
		move: '/api/v1/media/move',
		copy: '/api/v1/media/copy',
		rename: '/api/v1/media/rename',
		createFolder: '/api/v1/media/folder',
		deleteFolder: '/api/v1/media/folder',
		uploadSimple: '/api/v1/media/upload-simple',
		saveInformation: '/api/v1/media/information'
	}
};

export const mediaRepository = new MediaRepository(httpGateway, mediaConfig);

/** PM → VM for media reads; list loads call {@link MediaRepository} then map to VMs. */
export const getMediaPresenter = new GetMediaPresenter(mediaRepository);

export { MAX_MEDIA_UPLOAD_BYTES, MediaRepository } from './Media.repository.svelte';
export type {
	MediaDeleteViewModel,
	MediaLibraryItemViewModel,
	MediaListViewModel,
	MediaPickerBrowseViewModel,
	SaveMediaInformationViewModel,
	UploadSimpleViewModel
} from './GetMedia.presenter.svelte';
export { GetMediaPresenter } from './GetMedia.presenter.svelte';
export {
	mediaUploadLimitsHint,
	validateMediaFileUploadSize,
	validateMediaUploadSessionSize,
	MEDIA_VIRTUAL_GENERAL,
	MEDIA_VIRTUAL_POSTS,
	MEDIA_VIRTUAL_POSTS_UNSCHEDULED,
	normalizeMediaVirtualPath,
	mediaVirtualPathForComposerUpload,
	mediaFileManagerId,
	parseMediaFileManagerId,
	isMediaFileManagerFolderId,
	mediaVirtualPathFromFileManagerTarget
} from 'openquok-common';
export {
	resolveMediaLibraryUploadMode,
	type MediaLibraryUploadMode
} from './utils/mediaUpload';
export { formatBytes, isImageMediaPath, isVideoMediaPath } from './utils/mediaDisplay';
export { publicUrlForMediaStorageKey } from './utils/mediaUrls';
export type {
	MediaConfig,
	MediaDeleteProgrammerModel,
	MediaDeleteResponseDto,
	MediaLibraryItemProgrammerModel,
	MediaListProgrammerModel,
	MediaListResponseDto,
	SaveMediaInformationProgrammerModel,
	SaveMediaInformationResponseDto,
	UploadSimpleProgrammerModel,
	UploadSimpleResponseDto,
	MediaUploadProgrammerModel,
	MediaUploadResponseDto
} from './Media.repository.svelte';
