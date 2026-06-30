<script lang="ts">
	import type { PageData } from './$types';

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import { icons } from '$data/icons';
	import { getRootPathAccount, protectedAccountExtensionsPagePresenter } from '$lib/area-protected';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import HomeAccountNoticeBanner from '$lib/ui/components/home/HomeAccountNoticeBanner.svelte';
	import BookmarkedExtensionsGrid from '$lib/ui/components/extensions/BookmarkedExtensionsGrid.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = protectedAccountExtensionsPagePresenter;
	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);

	const extensionsVm = $derived(pagePresenter.extensionsVm);
	const loading = $derived(pagePresenter.loading);
	const bookmarksPaidEnabled = $derived(pagePresenter.bookmarksPaidEnabled);
	const bookmarkCount = $derived(pagePresenter.bookmarkCount);
	const togglingBookmarkId = $derived(pagePresenter.togglingBookmarkId);

	onMount(() => {
		if (!browser) return;
		void (async () => {
			const paid = await pagePresenter.loadBillingGateStateless();
			if (paid) {
				await pagePresenter.loadBookmarks();
			}
		})();
	});

	async function handleToggleBookmark(listingId: string, nextBookmarked: boolean) {
		const result = await pagePresenter.toggleBookmark(listingId, nextBookmarked);
		if (!result.ok) {
			toast.error(result.error);
		} else if (!nextBookmarked) {
			toast.success('Bookmark removed.');
		} else {
			toast.success('Extension bookmarked.');
		}
		return result;
	}
</script>

<div class="flex flex-col gap-5">
	<div class="rounded-[28px] border border-base-300/70 bg-base-100/70 p-5 shadow-sm backdrop-blur-sm sm:p-6">
		<div class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
			<div>
				<div class="flex items-center gap-3">
					<AbstractIcon
						name={icons.Bookmark.name}
						class="text-primary size-8 shrink-0"
						width="32"
						height="32"
					/>
					<div>
						<h1 class="text-2xl font-semibold text-base-content">Skilled & MCP Extensions</h1>
						<p class="text-sm text-base-content/65">Extensions you saved from the public hub</p>
					</div>
				</div>
				{#if bookmarksPaidEnabled === true && bookmarkCount > 0}
					<p class="mt-2 text-sm text-base-content/70">
						{bookmarkCount.toLocaleString()} bookmarked
					</p>
				{/if}
			</div>
		</div>

		{#if bookmarksPaidEnabled === false}
			<HomeAccountNoticeBanner
				iconName={icons.Sparkles.name}
				tone="upgrade"
				dismissible={false}
			>
				<p class="text-base-content/90">
					Extension bookmarks are available on paid plans. Upgrade to save extensions from the hub and
					access them here.
				</p>
				{#snippet actions()}
					<Button href={accountBillingHref} variant="secondary" size="sm" class="gap-1.5">
						<AbstractIcon name={icons.ArrowUp.name} class="size-4" width="16" height="16" />
						Upgrade plan
					</Button>
				{/snippet}
			</HomeAccountNoticeBanner>
		{:else if bookmarksPaidEnabled === true}
			<BookmarkedExtensionsGrid
				extensions={extensionsVm}
				{loading}
				isLoggedIn={data.isLoggedIn === true}
				bookmarksPaidEnabled={true}
				upgradeHref={accountBillingHref}
				{togglingBookmarkId}
				isBookmarked={(listingId) => pagePresenter.isBookmarked(listingId)}
				onToggleBookmark={handleToggleBookmark}
			/>
		{:else}
			<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
				Checking your plan…
			</p>
		{/if}
	</div>
</div>
