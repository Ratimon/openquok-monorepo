import type { FeedbackConfig } from '$lib/feedbacks/Feedback.repository.svelte';
import { httpGateway } from '$lib/core/index';
import { FeedbackRepository } from '$lib/feedbacks/Feedback.repository.svelte';
import { FeedbackPresenter } from '$lib/feedbacks/Feedback.presenter.svelte';
import { GetFeedbackPresenter } from '$lib/feedbacks/GetFeedback.presenter.svelte';

const feedbackConfig: FeedbackConfig = {
	endpoints: {
		createFeedback: '/api/v1/feedback',
		getAllFeedbacks: '/api/v1/feedback',
		handleFeedback: (feedbackId: string) => `/api/v1/feedback/${feedbackId}`
	}
};

const feedbackRepository = new FeedbackRepository(httpGateway, feedbackConfig);
/** Layout / popover (protected shell). */
const feedbackPresenter = new FeedbackPresenter(feedbackRepository);
/** Public pages (e.g. About) — separate instance so state does not leak from layout feedback. */
const generalFeedbackPresenter = new FeedbackPresenter(feedbackRepository);
/** Docs page thumbs — isolated from About / layout feedback presenters. */
const docsPageFeedbackPresenter = new FeedbackPresenter(feedbackRepository);
const getFeedbackPresenter = new GetFeedbackPresenter(feedbackRepository);

export {
	feedbackRepository,
	feedbackPresenter,
	generalFeedbackPresenter,
	docsPageFeedbackPresenter,
	getFeedbackPresenter
};
export { FeedbackStatus } from '$lib/feedbacks/Feedback.presenter.svelte';
export type {
	UpsertFeedbackProgrammerModel,
	FeedbackProgrammerModel,
	FeedbackManagerProgrammerModel
} from '$lib/feedbacks/Feedback.repository.svelte';
export type { FeedbackViewModel } from '$lib/feedbacks/GetFeedback.presenter.svelte';
export { feedbackDescriptionSchema } from '$lib/feedbacks/feedback.types';
export { default as FeedbackDialog } from '$lib/ui/components/feedback/FeedbackDialog.svelte';

/** View model for FeedbackPopoverForm: state and callbacks from parent (e.g. layout). */
export interface FeedbackPopoverViewModel {
	description: string;
	open: boolean;
	isSubmitting: boolean;
	isSuccess: boolean;
	successMessage: string;
	onSubmit: (description: string) => void | Promise<void>;
}