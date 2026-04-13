import type { GetFeedbackPresenter } from '$lib/feedback/GetFeedback.presenter.svelte';
import type { FeedbackViewModel } from '$lib/feedback/GetFeedback.presenter.svelte';
import type { FeedbackRepository } from '$lib/feedback/Feedback.repository.svelte';

export class AdminFeedbackManagerPagePresenter {
	public allFeedbacksToManageVm: FeedbackViewModel[] = $state([]);
	public showToastMessage = $state(false);
	public toastMessage = $state('');

	constructor(
		private readonly getFeedbackPresenter: GetFeedbackPresenter,
		private readonly feedbackRepository: FeedbackRepository
	) {}

	public async loadAllFeedbacks(fetch?: typeof globalThis.fetch): Promise<FeedbackViewModel[]> {
		const list = await this.getFeedbackPresenter.loadAllFeedbacks(fetch);
		this.allFeedbacksToManageVm = list;
		return this.allFeedbacksToManageVm;
	}

	/** Update VM only after handled state was saved elsewhere. No API call, no toast. */
	applyFeedbackHandledState(feedbackId: string, isHandled: boolean): void {
		this._applyFeedbackHandledState(feedbackId, isHandled);
	}

	public async handleFeedbackToggle(
		feedback: FeedbackViewModel,
		newState: boolean
	): Promise<void> {
		const resultPm = await this.feedbackRepository.handleFeedback(feedback.id, newState);

		if (resultPm.success) {
			this._applyFeedbackHandledState(feedback.id, newState);
			this.showToastMessage = true;
			this.toastMessage = resultPm.message || `Feedback ${newState ? 'marked as handled' : 'reopened'}.`;
		} else {
			this.showToastMessage = true;
			this.toastMessage = resultPm.message || 'Failed to update feedback.';
		}
	}

	private _applyFeedbackHandledState(feedbackId: string, isHandled: boolean): void {
		const idx = this.allFeedbacksToManageVm.findIndex((f) => f.id === feedbackId);
		if (idx < 0) return;
		const prev = this.allFeedbacksToManageVm[idx];
		this.allFeedbacksToManageVm = [
			...this.allFeedbacksToManageVm.slice(0, idx),
			{ ...prev, isHandled },
			...this.allFeedbacksToManageVm.slice(idx + 1)
		];
	}
}
