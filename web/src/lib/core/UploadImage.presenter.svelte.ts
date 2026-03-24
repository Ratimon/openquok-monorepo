import type { DatabaseName, ImageRepository } from '$lib/core/Image.repository.svelte';

export interface ImageUploadFnProgrammerModel {
	success: boolean;
	data: {
		filePath: string;
	};
	message: string;
}

export enum FileUploadStatus {
	UNKNOWN = 'unknown',
	UPLOADING = 'uploading',
	UPLOADED = 'uploaded'
}

export interface UploadViewModel {
	status: FileUploadStatus;
	filePath: string | null;
	showToastMessage: boolean;
	toastMessage: string;
}

export class UploadImagePresenter {
	public imageVm: UploadViewModel = $state({
		status: FileUploadStatus.UNKNOWN,
		filePath: null,
		showToastMessage: false,
		toastMessage: ''
	});

	constructor(private readonly imageRepository: ImageRepository) {}

	public async upload({
		databaseName,
		imageFile,
		uid
	}: {
		databaseName: DatabaseName;
		imageFile: File;
		uid: string;
	}): Promise<string | null> {
		this.imageVm.status = FileUploadStatus.UPLOADING;

		const resultPm = await this.imageRepository.uploadImage(databaseName, imageFile, uid);

		if (resultPm.success) {
			this.imageVm.showToastMessage = true;
			this.imageVm.toastMessage = resultPm.message;
			this.imageVm.status = FileUploadStatus.UPLOADED;
			this.imageVm.filePath = resultPm.data.filePath;
			return this.imageVm.filePath;
		}

		this.imageVm.showToastMessage = true;
		this.imageVm.toastMessage = resultPm.message;
		this.imageVm.status = FileUploadStatus.UNKNOWN;
		return null;
	}
}

