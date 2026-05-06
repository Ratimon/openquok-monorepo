<script lang="ts">
	import type { FeedbackViewModel } from '$lib/feedbacks';

	import { onMount } from 'svelte';
	import { toast } from '$lib/ui/sonner';
	import { adminFeedbackManagerPagePresenter } from '$lib/area-admin';
	import { getRootPathAdminArea } from '$lib/area-admin/constants/getRootPathAdminArea';
	import { absoluteUrl, route } from '$lib/utils/path';
	import Button from '$lib/ui/buttons/Button.svelte';
	import FeedbackTable from '$lib/ui/components/feedback/FeedbackTable.svelte';

	// /admin
	const rootPathAdminArea = getRootPathAdminArea();
	const adminAreaPath = route(rootPathAdminArea);

	type Props = { data: { isSuperAdmin?: boolean } };

	let { data }: Props = $props();

	let isSuperAdmin = $derived(data.isSuperAdmin ?? false);
	let canSeeAdminArea = $derived(isSuperAdmin);
	let adminAreaHref = $derived(absoluteUrl(adminAreaPath));

	let showHandled = $state(true);

	let allFeedbacksToManageVm = $derived(adminFeedbackManagerPagePresenter.allFeedbacksToManageVm);
	let showToastMessage = $derived(adminFeedbackManagerPagePresenter.showToastMessage);
	let toastMessage = $derived(adminFeedbackManagerPagePresenter.toastMessage);

	let visibleFeedbacks = $derived(
		showHandled ? allFeedbacksToManageVm : allFeedbacksToManageVm.filter((f) => !f.isHandled)
	);

	onMount(() => {
		adminFeedbackManagerPagePresenter.loadAllFeedbacks();
	});

	$effect(() => {
		if (showToastMessage) {
			const msg = toastMessage;
			if (msg && (msg.includes('Error') || msg.includes('Failed'))) {
				toast.error(msg);
			} else {
				toast.success(msg || 'Updated');
			}
			adminFeedbackManagerPagePresenter.showToastMessage = false;
		}
	});

	async function handleFeedbackToggle(feedback: FeedbackViewModel, newState: boolean) {
		await adminFeedbackManagerPagePresenter.handleFeedbackToggle(feedback, newState);
	}
</script>

<div class="p-4 md:p-6">
	<div class="flex items-start justify-between gap-4 flex-wrap">
		<div class="min-w-0">
			<h1 class="text-xl font-semibold text-base-content">
				Feedback manager</h1>
			<p class="text-sm text-base-content/70">
				Manage incoming feedback. Only editors can access this page.
			</p>
		</div>

		<div class="flex items-center gap-2 flex-wrap">
			{#if canSeeAdminArea}
				<Button variant="ghost" size="sm" href={adminAreaHref}>
					Admin area
				</Button>
			{/if}
			<label class="label cursor-pointer gap-2">
				<span class="label-text">Show handled</span>
				<input class="toggle toggle-sm" type="checkbox" bind:checked={showHandled} />
			</label>
		</div>
	</div>

	<div class="mt-4">
		<FeedbackTable feedbacksVm={visibleFeedbacks} onHandleToggle={handleFeedbackToggle} />
	</div>
</div>
