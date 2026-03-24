import type {
	FeedbackRepository,
	CreateFeedbackProgrammerModel
} from '$lib/feedback/Feedback.repository.svelte';

export enum FeedbackStatus {
	UNKNOWN = 'unknown',
	SUBMITTING = 'submitting',
	SUCCESS = 'success'
}

export class FeedbackPresenter {
	private feedbackRepository: FeedbackRepository;

	public status: FeedbackStatus = $state(FeedbackStatus.UNKNOWN);
	public showToastMessage: boolean = $state(false);
	public toastMessage: string = $state('');

	constructor(feedbackRepository: FeedbackRepository) {
		this.feedbackRepository = feedbackRepository;
	}

	public async createFeedback(
		feedbackType: 'propose' | 'report' | 'feedback',
		url: string,
		description: string,
		email: string
	): Promise<CreateFeedbackProgrammerModel | null> {
		this.status = FeedbackStatus.SUBMITTING;

		const createFeedbackPm = await this.feedbackRepository.createFeedback({
			feedback_type: feedbackType,
			url,
			description,
			email: email || undefined
		});

		if (createFeedbackPm.success) {
			this.showToastMessage = true;
			this.toastMessage = createFeedbackPm.message;
			this.status = FeedbackStatus.SUCCESS;
			return createFeedbackPm;
		} else {
			this.showToastMessage = true;
			this.toastMessage = createFeedbackPm.message;
			this.status = FeedbackStatus.UNKNOWN;
			return null;
		}
	}

	public reset() {
		this.status = FeedbackStatus.UNKNOWN;
		this.showToastMessage = false;
		this.toastMessage = '';
	}
}
