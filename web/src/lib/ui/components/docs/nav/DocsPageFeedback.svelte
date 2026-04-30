<script lang="ts">
	import { page } from '$app/state';

	import { docsPageFeedbackPresenter, FeedbackStatus } from '$lib/feedbacks';

	import { icons } from '$data/icon';

	import FeedbackDialog from '$lib/ui/components/feedback/FeedbackDialog.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import { toast } from '$lib/ui/sonner';

	let { pageTitle }: { pageTitle: string } = $props();

	let feedback: 'up' | 'down' | null = $state(null);
	let authDialogOpen = $state(false);

	let isLoggedIn = $derived(page.data.isLoggedIn ?? false);
	// Prerender-safe: avoid querystrings/hashes for docs URLs.
	let pageUrl = $derived(page.url.pathname);
	let signinReturnPath = $derived(page.url.pathname);
	let status = $derived(docsPageFeedbackPresenter.status);
	let toastMessage = $derived(docsPageFeedbackPresenter.toastMessage);
	let isSubmitting = $derived(status === FeedbackStatus.SUBMITTING);

	$effect(() => {
		void pageUrl;
		void pageTitle;
		feedback = null;
	});

	async function handleCreateFeedback(
		feedbackType: 'propose' | 'report' | 'feedback',
		url: string,
		description: string,
		email: string
	) {
		return docsPageFeedbackPresenter.createFeedback(feedbackType, url, description, email);
	}

	function handleResetFeedback() {
		docsPageFeedbackPresenter.reset();
	}

	async function onThumbClick(helpful: boolean) {
		if (!isLoggedIn) {
			docsPageFeedbackPresenter.reset();
			authDialogOpen = true;
			return;
		}
		const result = await docsPageFeedbackPresenter.submitDocsPageHelpfulVote(
			helpful,
			pageUrl,
			pageTitle
		);
		if (result?.success) {
			feedback = helpful ? 'up' : 'down';
			toast.success(helpful ? 'Thumb Up!' : 'Thumb Down!');
			docsPageFeedbackPresenter.reset();
		} else {
			toast.error(toastMessage || 'Could not submit feedback.');
			docsPageFeedbackPresenter.reset();
		}
	}
</script>

<div class="text-base-content/70 flex items-center gap-2 text-sm">
	{#if feedback}
		<span>Thanks for the feedback!</span>
	{:else}
		<span>Was this page helpful?</span>
		<Button
			variant="ghost"
			size="icon"
			onclick={() => onThumbClick(true)}
			disabled={isSubmitting}
			aria-label="Yes, this page was helpful"
		>
			<AbstractIcon name={icons.ThumbsUp.name} class="size-4" width="16" height="16" />
		</Button>
		<Button
			variant="ghost"
			size="icon"
			onclick={() => onThumbClick(false)}
			disabled={isSubmitting}
			aria-label="No, this page was not helpful"
		>
			<AbstractIcon name={icons.ThumbsDown.name} class="size-4" width="16" height="16" />
		</Button>
	{/if}
</div>

<FeedbackDialog
	bind:open={authDialogOpen}
	showTriggerButton={false}
	fixed={false}
	status={status}
	feedbackType="feedback"
	{isLoggedIn}
	{toastMessage}
	feedbackTitle="Sign in to rate this page"
	feedbackDescription="Sign in so we can record whether this documentation page was helpful. You can also send detailed feedback after signing in."
	ModalSuccessMessage="Thank you for your feedback! We will review it and get back to you soon."
	url={pageUrl}
	signinReturnPath={signinReturnPath}
	handleCreateFeedback={handleCreateFeedback}
	handleReset={handleResetFeedback}
/>
