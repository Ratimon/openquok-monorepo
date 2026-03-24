import type { DatabaseName, ImageRepository } from '$lib/core/Image.repository.svelte';

export enum DownloadStatus {
	UNKNOWN = 'unknown',
	LOADING = 'loading',
	SUCCESS = 'success'
}

export interface DownloadViewModel {
	imageUrl: string | null;
	status: DownloadStatus;
}

export class DownloadImagePresenter {
	public imageVm: DownloadViewModel = $state({
		imageUrl: null,
		status: DownloadStatus.UNKNOWN
	});

	constructor(private readonly imageRepository: ImageRepository) {}

	public async loadImage(databaseName: DatabaseName, imageUrl: string) {
		const prev = this.imageVm.imageUrl;
		if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
		this.imageVm = { imageUrl: null, status: DownloadStatus.LOADING };

		const blobPm = await this.imageRepository.getImageBlobByUrl(databaseName, imageUrl);
		if (blobPm?.blob instanceof Blob) {
			this.imageVm = {
				imageUrl: URL.createObjectURL(blobPm.blob),
				status: DownloadStatus.SUCCESS
			};
			return this.imageVm;
		}

		this.imageVm = { imageUrl: null, status: DownloadStatus.UNKNOWN };
		return this.imageVm;
	}
}

