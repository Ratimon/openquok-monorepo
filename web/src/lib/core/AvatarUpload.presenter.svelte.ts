import type { DatabaseName } from '$lib/core/Image.repository.svelte';
import { FileUploadStatus } from '$lib/core/UploadImage.presenter.svelte';

import { UploadImagePresenter } from '$lib/core/UploadImage.presenter.svelte';
import { DownloadImagePresenter, DownloadStatus } from '$lib/core/DownloadImage.presenter.svelte';

export interface AvatarUploadViewModel {
	avatarUrl: string | null;
	uploadStatus: FileUploadStatus;
	showToastMessage: boolean;
	toastMessage: string;
	filePath: string | null | undefined;
}

export class AvatarUploadPresenter {
	public avatarVm: AvatarUploadViewModel = $state({
		avatarUrl: null,
		uploadStatus: FileUploadStatus.UNKNOWN,
		showToastMessage: false,
		toastMessage: '',
		filePath: null
	});

	constructor(
		private readonly downloadImagePresenter: DownloadImagePresenter,
		private readonly uploadImagePresenter: UploadImagePresenter
	) {}

	/** Drop blob preview + download VM (call when form url is cleared or dialog opens with no avatar). */
	clearLoadedPreview(): void {
		const u = this.avatarVm.avatarUrl;
		if (u?.startsWith('blob:')) URL.revokeObjectURL(u);
		this.avatarVm.avatarUrl = null;
		this.downloadImagePresenter.imageVm = {
			imageUrl: null,
			status: DownloadStatus.UNKNOWN
		};
	}

	async loadAvatar(databaseName: DatabaseName, imageUrl: string) {
		await this.downloadImagePresenter.loadImage(databaseName, imageUrl);
		this.avatarVm.avatarUrl = this.downloadImagePresenter.imageVm.imageUrl;
	}

	async uploadAvatar(databaseName: DatabaseName, imageFile: File, uid: string) {
		this.avatarVm.uploadStatus = FileUploadStatus.UPLOADING;

		try {
			await this.uploadImagePresenter.upload({
				databaseName,
				imageFile,
				uid
			});

			this.avatarVm.showToastMessage = this.uploadImagePresenter.imageVm.showToastMessage;
			this.avatarVm.toastMessage = this.uploadImagePresenter.imageVm.toastMessage;
			this.avatarVm.uploadStatus = this.uploadImagePresenter.imageVm.status;

			this.avatarVm.filePath = this.uploadImagePresenter.imageVm.filePath;

			if (this.avatarVm.filePath) {
				await this.loadAvatar(databaseName, this.avatarVm.filePath);
			}
		} catch (error) {
			this.avatarVm.uploadStatus = FileUploadStatus.UNKNOWN;
			throw error;
		}
	}
}
