<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/state';
	import { generalFeedbackPresenter } from '$lib/feedbacks';
	import { url } from '$lib/utils/path';

	import FeedbackDialog from '$lib/ui/components/feedback/FeedbackDialog.svelte';

	type Props = {
		data: PageData;
	} & PageData;

	let { data }: Props = $props();
	let { isLoggedIn, companyName, companyUrl, supportEmail } = $derived(data);

	let feedbackStatus = $derived(generalFeedbackPresenter.status);
	let feedbackToastMessage = $derived(generalFeedbackPresenter.toastMessage);
	let feedbackPageUrl = $derived(page.url.href);
	let supportContactHref = $derived(
		supportEmail.includes('@') ? `mailto:${supportEmail}` : supportEmail
	);

	async function handleCreateFeedback(
		feedbackType: 'propose' | 'report' | 'feedback',
		feedbackUrl: string,
		description: string,
		email: string
	) {
		return generalFeedbackPresenter.createFeedback(feedbackType, feedbackUrl, description, email);
	}

	function handleResetFeedback() {
		generalFeedbackPresenter.reset();
	}
</script>

<section class="px-4 py-8 text-center">
	<div class="mx-auto max-w-lg">
		<img
			class="mx-auto h-24 w-24"
			src={url('/pwa/favicon.svg')}
			alt="{companyName} logo"
			width={96}
			height={96}
		/>

		<h1 class="mt-8 text-3xl font-black tracking-tight">About {companyName}</h1>

		<p class="mt-4 text-base text-base-content/80">
			<strong class="text-base-content">{companyName}</strong> is the legal business name of the
			company behind this website.
		</p>

		<p class="mt-6 text-lg font-medium text-base-content/90">
			We are an engineering and product focused team building agentic social media scheduling
			tools.
		</p>

		{#if companyUrl}
			<p class="mt-6 text-sm text-base-content/70">
				Website:
				<a href={companyUrl} class="link link-hover text-base-content/90">{companyUrl}</a>
			</p>
		{/if}

		<p class="mt-6 text-secondary">
			Contact us at
			<a class="link link-hover" href={supportContactHref} target="_blank" rel="noreferrer">
				{supportEmail}
			</a>
		</p>
	</div>

	<FeedbackDialog
		status={feedbackStatus}
		feedbackType="feedback"
		fixed={true}
		isLoggedIn={isLoggedIn}
		toastMessage={feedbackToastMessage}
		feedbackTitle="Give us feedback"
		feedbackDescription="What would you like to see improved?"
		ModalSuccessMessage="Thank you for your feedback! We will review it and get back to you soon."
		url={feedbackPageUrl}
		handleCreateFeedback={handleCreateFeedback}
		handleReset={handleResetFeedback}
	/>
</section>
