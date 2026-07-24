<script lang="ts">
	import type { PageData } from './$types';

	import { page } from '$app/state';
	import { generalFeedbackPresenter } from '$lib/feedbacks';

	import { getRootPathPublicRoadmap } from '$lib/area-public/constants/getRootPathPublicRoadmap';
	import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
	import { route } from '$lib/utils/path';

	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';
	import FeedbackDialog from '$lib/ui/components/feedback/FeedbackDialog.svelte';
	import SocialFollowBar from '$lib/ui/social/SocialFollowBar.svelte';

	// /roadmap
	const rootPathPublicRoadmap = getRootPathPublicRoadmap();
	const publicRoadmapPath = route(rootPathPublicRoadmap);

	type Props = { data: PageData };

	let { data }: Props = $props();

	let isLoggedIn = $derived(data.isLoggedIn);
	let schemaData = $derived(data.schemaData);
	let companyName = $derived(data.companyName || CONFIG_SCHEMA_COMPANY.NAME.default);
	let supportEmail = $derived(
		String(data.supportEmail || CONFIG_SCHEMA_COMPANY.SUPPORT_EMAIL.default)
	);
	let supportPhone = $derived(String(data.supportPhone || '').trim());
	let companyAddress = $derived(String(data.companyAddress || '').trim());

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

<JsonLdHead schemaData={schemaData} />

<section class="py-2 px-4 text-center">
	<div class="max-w-auto md:max-w-lg mx-auto">
		<p class="!text-2xl flex justify-center space-x-2 font-black my-8">
			About {companyName}
		</p>

		<p class="!text-xl flex justify-center space-x-2 my-8">
			We are engineering and product focused team
		</p>

		<p class="mt-6 text-secondary">
			See what we are planning, building, and shipping on our
			<a class="underline" href={publicRoadmapPath}>roadmap</a>.
		</p>

		<div class="mt-6 space-y-2 text-secondary">
			<p>
				Contact us at
				<a
					class="underline"
					href={'mailto:' + supportEmail}
					target="_blank"
					rel="noreferrer"
				>{supportEmail}</a>
			</p>
			{#if supportPhone}
				<p>
					Phone:
					<a class="underline" href="tel:{supportPhone.replace(/\s+/g, '')}">{supportPhone}</a>
				</p>
			{/if}
			{#if companyAddress}
				<p class="whitespace-pre-line">
					{companyAddress}
				</p>
			{/if}
		</div>

		<div class="mt-8 flex flex-col items-center gap-3">
			<p class="text-secondary">Follow us</p>
			<SocialFollowBar
				direction="horizontal"
				size="sm"
				class="text-sm text-base-content/80 hover:text-base-content"
			/>
		</div>

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
