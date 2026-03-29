import type { FeedbackConfig } from '$lib/feedback/Feedback.repository.svelte';
import { httpGateway } from '$lib/core/index';
import { FeedbackRepository } from '$lib/feedback/Feedback.repository.svelte';
import { FeedbackPresenter } from '$lib/feedback/Feedback.presenter.svelte';
import { GetFeedbackPresenter } from '$lib/feedback/GetFeedback.presenter.svelte';

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
export { FeedbackStatus } from '$lib/feedback/Feedback.presenter.svelte';
export type {
	CreateFeedbackProgrammerModel,
	FeedbackProgrammerModel,
	FeedbackManagerProgrammerModel
} from '$lib/feedback/Feedback.repository.svelte';
export type { FeedbackViewModel } from '$lib/feedback/GetFeedback.presenter.svelte';
export { feedbackDescriptionSchema } from '$lib/feedback/feedback.types';
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