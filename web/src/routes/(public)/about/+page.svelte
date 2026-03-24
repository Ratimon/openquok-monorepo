<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/state';
	import { generalFeedbackPresenter } from '$lib/feedback';

	import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';

	import FeedbackDialog from '$lib/ui/components/feedback/FeedbackDialog.svelte';

	type Props = {
		data: PageData;
	} & PageData;

	let { data }: Props = $props();
	let { isLoggedIn } = $derived(data);

	let feedbackStatus = $derived(generalFeedbackPresenter.status);
	let feedbackToastMessage = $derived(generalFeedbackPresenter.toastMessage);
	/** Page URL where the user is sending feedback from (sent to API). */
	let feedbackPageUrl = $derived(page.url.href);

	async function handleCreateFeedback(
		feedbackType: 'propose' | 'report' | 'feedback',
		url: string,
		description: string,
		email: string
	) {
		return generalFeedbackPresenter.createFeedback(feedbackType, url, description, email);
	}

	function handleResetFeedback() {
		generalFeedbackPresenter.reset();
	}
</script>

<section class="py-2 px-4 text-center">
	<div class="max-w-auto md:max-w-lg mx-auto">
		<p class="!text-2xl flex justify-center space-x-2 font-black my-8">
			About {page.data.companyName || CONFIG_SCHEMA_COMPANY.NAME.default}
		</p>

		<p class="!text-xl flex justify-center space-x-2 my-8">
			We are engineering and product focused team
		</p>

		<p class="mt-6 text-secondary">
			Contact us at
			<a
				class="underline"
				href={'mailto:' + (page.data.supportEmail || CONFIG_SCHEMA_COMPANY.SUPPORT_EMAIL.default)}
				target="_blank"
				rel="noreferrer"
				>{page.data.supportEmail || CONFIG_SCHEMA_COMPANY.SUPPORT_EMAIL.default}</a
			>
		</p>

		<!-- to do : add testimonials -->
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
