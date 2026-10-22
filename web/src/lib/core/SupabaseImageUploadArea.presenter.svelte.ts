import type { DatabaseName } from '$lib/core/Image.repository.svelte';

import { FileDeleteStatus } from '$lib/core/DeleteImage.presenter.svelte';
import { DeleteImagePresenter } from '$lib/core/DeleteImage.presenter.svelte';
import { DownloadImagePresenter } from '$lib/core/DownloadImage.presenter.svelte';
import { FileUploadStatus } from '$lib/core/UploadImage.presenter.svelte';
import { UploadImagePresenter } from '$lib/core/UploadImage.presenter.svelte';

export interface UploadAreaViewModel {
	imageURL: string | null;
	uploadStatus: FileUploadStatus | FileDeleteStatus;
	showToastMessage: boolean;
	toastMessage: string;
	filePath: string | null | undefined;
}

export class SupabaseImageUploadAreaPresenter {
	public uploadAreaVm: UploadAreaViewModel = $state({
		imageURL: null,
		uploadStatus: FileUploadStatus.UNKNOWN,
		showToastMessage: false,
		toastMessage: '',
		filePath: null
	});

	private lastLoadedStorageKey: string | null = null;

	constructor(
		private readonly downloadImagePresenter: DownloadImagePresenter,
		private readonly uploadImagePresenter: UploadImagePresenter,
		private readonly deleteImagePresenter: DeleteImagePresenter,
	) {}

	public setDisplayUrl(url: string) {
		this.uploadAreaVm.imageURL = url;
	}

	public async loadImage(databaseName: DatabaseName, imageUrl: string) {
		const storageKey = imageUrl.trim();
		if (!storageKey) {
			this.uploadAreaVm.imageURL = null;
			return;
		}
		if (
			this.lastLoadedStorageKey === storageKey &&
			this.uploadAreaVm.imageURL?.startsWith('blob:')
		) {
			return;
		}
		await this.downloadImagePresenter.loadImage(databaseName, storageKey);
		this.uploadAreaVm.imageURL = this.downloadImagePresenter.imageVm.imageUrl;
		this.lastLoadedStorageKey = storageKey;
	}

	public async uploadImage(databaseName: DatabaseName, imageFile: File, uid: string) {
		this.uploadAreaVm.uploadStatus = FileUploadStatus.UPLOADING;
		try {
			await this.uploadImagePresenter.upload({ databaseName, imageFile, uid });

			this.uploadAreaVm.showToastMessage = this.uploadImagePresenter.imageVm.showToastMessage;
			this.uploadAreaVm.toastMessage = this.uploadImagePresenter.imageVm.toastMessage;
			this.uploadAreaVm.uploadStatus = this.uploadImagePresenter.imageVm.status;
			this.uploadAreaVm.filePath = this.uploadImagePresenter.imageVm.filePath;

			if (this.uploadAreaVm.filePath) {
				// Upload is already successful at this point. If preview loading fails
				// (e.g. transient storage read timing), keep upload success and do not throw.
				try {
					await this.loadImage(databaseName, this.uploadAreaVm.filePath);
				} catch {
					this.uploadAreaVm.imageURL = null;
				}
			}
		} catch (error) {
			this.uploadAreaVm.uploadStatus = FileUploadStatus.UNKNOWN;
			throw error;
		}
	}

	public async deleteImage(databaseName: DatabaseName, imagePath: string) {
		if (!imagePath) return;

		await this.deleteImagePresenter.delete(databaseName, imagePath);
		this.uploadAreaVm.showToastMessage = this.deleteImagePresenter.imageVm.showToastMessage;
		this.uploadAreaVm.toastMessage = this.deleteImagePresenter.imageVm.toastMessage;
		this.uploadAreaVm.uploadStatus = this.deleteImagePresenter.imageVm.status;
		this.uploadAreaVm.imageURL = null;
		this.uploadAreaVm.filePath = null;
	}

	public reset() {
		this.lastLoadedStorageKey = null;
		this.uploadAreaVm.imageURL = null;
		this.uploadAreaVm.filePath = null;
		this.uploadAreaVm.uploadStatus = FileUploadStatus.UNKNOWN;
		this.uploadAreaVm.showToastMessage = false;
		this.uploadAreaVm.toastMessage = '';
	}
}

