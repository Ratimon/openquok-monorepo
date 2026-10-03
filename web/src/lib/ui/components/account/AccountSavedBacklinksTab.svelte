<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	import { publicBuildBacklinksBookmarksPresenter } from '$lib/link-directory/index';
	import { getRootPathPublicBuildBacklinks } from '$lib/area-public/constants/getRootPathPublicBuildBacklinks';
	import { hostedMarketingHref } from '$lib/utils/hostedMarketingHref';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import BuildBacklinksSavedSitesPanel from '$lib/ui/templates/build-backlinks/BuildBacklinksSavedSitesPanel.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		isLoggedIn: boolean;
	};

	let { isLoggedIn }: Props = $props();

	const bookmarksPresenter = publicBuildBacklinksBookmarksPresenter;

	const buildBacklinksHubHref = $derived(
		url(hostedMarketingHref(route(getRootPathPublicBuildBacklinks()), page.url.origin))
	);

	const orderedSlugs = $derived(bookmarksPresenter.orderedSlugs);
	const hydrating = $derived(bookmarksPresenter.hydrating);
	const canReorder = $derived(bookmarksPresenter.canReorder);
	const canMarkComplete = $derived(bookmarksPresenter.canMarkComplete);
	const isCompleted = (siteSlug: string) => bookmarksPresenter.isCompleted(siteSlug);

	const savedSitesBySlug = $derived(bookmarksPresenter.buildSitesBySlugLookup([]));
	const hasUnsavedOrder = $derived(bookmarksPresenter.hasUnsavedOrderChanges());
	const savingOrder = $derived(bookmarksPresenter.savingOrder);

	onMount(() => {
		if (!browser) return;
		void bookmarksPresenter.hydrate(isLoggedIn);
	});

	function handleMove(siteSlug: string, direction: 'up' | 'down') {
		const result = bookmarksPresenter.moveBookmark(siteSlug, direction);
		if (!result.ok && result.error) {
			toast.error(result.error);
		}
	}

	async function handleSaveOrder() {
		const result = await bookmarksPresenter.saveOrder();
		if (result.ok) {
			toast.success('Order saved');
		} else if (result.error) {
			toast.error(result.error);
		}
	}

	async function handleToggleComplete(siteSlug: string) {
		const result = await bookmarksPresenter.toggleCompleted(siteSlug);
		if (!result.ok && result.error) {
			toast.error(result.error);
		}
	}
</script>

<div class="space-y-4">
	{#if hydrating}
		<p class="text-sm text-base-content/60">Loading your saved sites…</p>
	{:else if orderedSlugs.length === 0}
		<div class="rounded-xl border border-base-300/60 bg-base-200/40 p-6 text-center">
			<p class="text-base font-medium">No backlink sites saved yet</p>
			<p class="mt-1 text-sm text-base-content/65">
				Bookmark sites on the Build Backlinks hub to build a shortlist for outreach.
			</p>
			<div class="mt-4">
				<Button href={buildBacklinksHubHref} variant="primary" size="sm">
					Browse build backlinks
				</Button>
			</div>
		</div>
	{:else}
		<BuildBacklinksSavedSitesPanel
			{orderedSlugs}
			sitesBySlug={savedSitesBySlug}
			{canReorder}
			{canMarkComplete}
			{isCompleted}
			onMove={handleMove}
			onToggleComplete={handleToggleComplete}
		/>
		{#if canReorder}
			<div class="flex flex-wrap items-center justify-between gap-3">
				<p class="text-xs text-base-content/50">
					{#if hasUnsavedOrder}
						You have unsaved order changes.
					{:else}
						Reorder with the arrows, then save when you are done.
					{/if}
				</p>
				<Button
					type="button"
					variant="primary"
					size="sm"
					disabled={!hasUnsavedOrder || savingOrder}
					onclick={handleSaveOrder}
				>
					{savingOrder ? 'Saving…' : 'Save order'}
				</Button>
			</div>
		{/if}
	{/if}
</div>
