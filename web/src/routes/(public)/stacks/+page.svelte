<script lang="ts">
	import type { PageData } from './$types';

	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	import { getRootPathAccount } from '$lib/area-protected';
	import { getBillingPresenter } from '$lib/billing';
	import {
		loadBookmarkedIdsMap,
		toggleListingBookmark
	} from '$lib/listings/utils/listingBookmarkFeedback';
	import { isPaidSubscriptionTier } from 'openquok-common';
	import { authenticationRepository } from '$lib/user-auth';
	import { route, url } from '$lib/utils/path';

	import SectionOuterContainer from '$lib/ui/layouts/SectionOuterContainer.svelte';
	import StackHubCard from '$lib/ui/templates/stacks/StackHubCard.svelte';
	import JsonLdHead from '$lib/ui/components/seo/JsonLdHead.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	let stacksVm = $derived(data.stacksVm);
	let metaTitle = $derived(data.metaTitle);
	let metaDescription = $derived(data.metaDescription);
	let schemaData = $derived(data.schemaData);
	let searchTerm = $derived(data.searchTerm ?? '');
	let searchDraft = $state('');

	const isLoggedIn = $derived(authenticationRepository.isAuthenticated() || data.isLoggedIn === true);
	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);

	let bookmarksPaidEnabled = $state<boolean | null>(null);
	let bookmarkedIds = $state<Record<string, boolean>>({});

	$effect(() => {
		searchDraft = searchTerm;
	});

	$effect(() => {
		if (!browser || !isLoggedIn) {
			bookmarksPaidEnabled = null;
			return;
		}
		let cancelled = false;
		void getBillingPresenter.loadOwnedAccountBillingVmStateless().then((vm) => {
			if (cancelled) return;
			bookmarksPaidEnabled = vm ? isPaidSubscriptionTier(vm.tier) : false;
		});
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (!browser || !isLoggedIn) {
			bookmarkedIds = {};
			return;
		}
		if (bookmarksPaidEnabled !== true) return;

		let cancelled = false;
		void loadBookmarkedIdsMap().then((map) => {
			if (!cancelled) bookmarkedIds = map;
		});
		return () => {
			cancelled = true;
		};
	});

	async function handleToggleBookmark(listingId: string, nextBookmarked: boolean) {
		const result = await toggleListingBookmark(listingId, nextBookmarked, { listingKind: 'stack' });
		if (result.ok) {
			bookmarkedIds = { ...bookmarkedIds, [listingId]: nextBookmarked };
		}
		return result;
	}

	function applySearch() {
		const params = new URLSearchParams();
		const term = searchDraft.trim();
		if (term) params.set('search', term);
		const href = params.toString() ? `?${params.toString()}` : '';
		void goto(href, { keepFocus: true, noScroll: true });
	}
</script>

<JsonLdHead schemaData={schemaData} />

<SectionOuterContainer class="py-10 md:py-14">
	<header class="container mx-auto max-w-6xl space-y-4 px-4 text-center">
		<p class="text-xs font-bold tracking-wider text-primary uppercase">Stacks</p>
		<h1 class="text-3xl font-black tracking-tight text-base-content sm:text-4xl">{metaTitle}</h1>
		<p class="mx-auto max-w-3xl text-base text-base-content/70">{metaDescription}</p>
		<form class="mx-auto flex max-w-xl gap-2 pt-2" onsubmit={(e) => { e.preventDefault(); applySearch(); }}>
			<input
				class="input input-bordered w-full"
				placeholder="Search stacks…"
				bind:value={searchDraft}
			/>
			<button type="submit" class="btn btn-primary">Search</button>
		</form>
	</header>

	<section class="container mx-auto mt-10 max-w-6xl px-4">
		{#if stacksVm.length === 0}
			<p class="rounded-2xl border border-dashed border-base-content/15 p-8 text-center text-base-content/70">
				No published stacks match your search yet.
			</p>
		{:else}
			<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each stacksVm as stack (stack.id)}
					<li>
						<StackHubCard
							stackVm={stack}
							showBookmark={true}
							isBookmarked={bookmarkedIds[stack.id] === true}
							{isLoggedIn}
							{bookmarksPaidEnabled}
							upgradeHref={accountBillingHref}
							onToggleBookmark={handleToggleBookmark}
						/>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</SectionOuterContainer>
