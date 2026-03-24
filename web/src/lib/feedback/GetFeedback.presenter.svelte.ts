import type { FeedbackRepository, FeedbackProgrammerModel } from '$lib/feedback/Feedback.repository.svelte';

/** View model for feedback list (e.g. feedback manager page). */
export interface FeedbackViewModel {
	id: string;
	feedbackType: string;
	url: string;
	description: string;
	email: string | null;
	isHandled: boolean;
	createdAt: string;
}

export class GetFeedbackPresenter {
	constructor(private readonly feedbackRepository: FeedbackRepository) {}

	public async loadAllFeedbacks(fetch?: typeof globalThis.fetch): Promise<FeedbackViewModel[]> {
		const feedbacksPm = await this.feedbackRepository.getAllFeedbacks(fetch);
		return feedbacksPm.map((feedback: FeedbackProgrammerModel): FeedbackViewModel => ({
			id: feedback.id,
			feedbackType: feedback.feedbackType,
			url: feedback.url,
			description: feedback.description,
			email: feedback.email,
			isHandled: feedback.isHandled,
			createdAt: feedback.createdAt
		}));
	}
}
