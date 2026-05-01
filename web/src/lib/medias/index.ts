import type { MediaConfig } from './Media.repository.svelte';
import { httpGateway } from '$lib/core/index';
import { GetMediaPresenter } from './GetMedia.presenter.svelte';
import { MediaRepository } from './Media.repository.svelte';

const mediaConfig: MediaConfig = {
	endpoints: {
		list: '/api/v1/media',
		upload: '/api/v1/media/upload',
		delete: '/api/v1/media/delete',
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
	SaveMediaInformationViewModel,
	UploadSimpleViewModel
} from './GetMedia.presenter.svelte';
export { GetMediaPresenter } from './GetMedia.presenter.svelte';
export { maxMediaUploadShortLabel } from 'openquok-common';
export {
	resolveMediaLibraryUploadMode,
	type MediaLibraryUploadMode
} from './utils/mediaLibraryUploadEnv';
export { formatBytes } from './utils/formatBytes';
export { publicUrlForMediaStorageKey } from './utils/publicMediaObjectUrl';
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
