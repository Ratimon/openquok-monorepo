import type { MediaConfig } from './Media.repository.svelte';
import { httpGateway } from '$lib/core/index';
import { MediaRepository } from './Media.repository.svelte';

const mediaConfig: MediaConfig = {
	endpoints: {
		list: '/api/v1/media',
		download: '/api/v1/media/download',
		upload: '/api/v1/media/upload',
		delete: '/api/v1/media/delete'
	}
};

export const mediaRepository = new MediaRepository(httpGateway, mediaConfig);

export { MAX_MEDIA_UPLOAD_BYTES, MediaRepository } from './Media.repository.svelte';
export type {
	MediaConfig,
	MediaDeleteProgrammerModel,
	MediaDeleteResponseDto,
	MediaLibraryItemProgrammerModel,
	MediaListProgrammerModel,
	MediaListResponseDto,
	MediaProgrammerModel,
	MediaUploadProgrammerModel,
	MediaUploadResponseDto
} from './Media.repository.svelte';
