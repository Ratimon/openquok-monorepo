<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	import { page } from '$app/state';

	import SetPostingScheduleTimezone from '$lib/ui/components/SetPostingScheduleTimezone.svelte';
	import FirstBilling from '$lib/ui/components/billing/FirstBilling.svelte';
	import PostsLimitProvider from '$lib/ui/components/posts/PostsLimitProvider.svelte';
	import { firstBillingGatePresenter } from '$lib/billing';
	import { workspaceSettingsPresenter } from '$lib/settings';

	type ProtectedLayoutProps = {
		children: Snippet;
		data: LayoutData;
	};

	let { children, data }: ProtectedLayoutProps = $props();

	const companyName = $derived((data as App.LayoutData)?.companyNameVm ?? 'Openquok');
	const checkoutId = $derived(page.url.searchParams.get('checkout'));
	const gateLoading = $derived(firstBillingGatePresenter.loading);
	const showFirstBilling = $derived(
		firstBillingGatePresenter.restrictFreeUser && !checkoutId
	);

	$effect(() => {
		workspaceSettingsPresenter.currentWorkspaceId;
		page.url.pathname;
		page.url.searchParams.get('checkout');
		void firstBillingGatePresenter.evaluate();
	});
</script>

<SetPostingScheduleTimezone />

{#if gateLoading}
	<div class="flex min-h-screen items-center justify-center bg-base-200">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{:else if showFirstBilling}
	<FirstBilling {companyName} />
{:else}
	<PostsLimitProvider>
		{@render children?.()}
	</PostsLimitProvider>
{/if}
