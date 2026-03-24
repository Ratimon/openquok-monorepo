import type { DatabaseName, ImageRepository } from '$lib/core/Image.repository.svelte';

export enum FileDeleteStatus {
	UNKNOWN = 'unknown',
	DELETING = 'deleting',
	DELETED = 'deleted'
}

interface DeleteImageViewModel {
	status: FileDeleteStatus;
	showToastMessage: boolean;
	toastMessage: string;
}

export class DeleteImagePresenter {
	public imageVm: DeleteImageViewModel = $state({
		status: FileDeleteStatus.UNKNOWN,
		showToastMessage: false,
		toastMessage: ''
	});

	constructor(private readonly imageRepository: ImageRepository) {}

	public async delete(databaseName: DatabaseName, imagePath: string) {
		if (!imagePath) return;

		try {
			this.imageVm.status = FileDeleteStatus.DELETING;

			const result = await this.imageRepository.deleteImage(databaseName, imagePath);
			if (result.success) {
				this.imageVm.status = FileDeleteStatus.DELETED;
				this.imageVm.showToastMessage = false;
				this.imageVm.toastMessage = '';
				return;
			}

			this.imageVm.status = FileDeleteStatus.UNKNOWN;
			this.imageVm.showToastMessage = true;
			this.imageVm.toastMessage = result.message;
			throw new Error(result.message);
		} catch (error) {
			this.imageVm.status = FileDeleteStatus.UNKNOWN;
			this.imageVm.showToastMessage = true;
			this.imageVm.toastMessage = error instanceof Error ? error.message : 'Failed to delete image';
			throw error;
		}
	}
}

