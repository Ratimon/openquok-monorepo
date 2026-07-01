<script lang="ts">
	import type { PageData } from './$types';
	import type { AccountListingCollectionItemViewModel } from '$lib/area-protected/ProtectedAccountExtensionsPage.presenter.svelte';

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	import { icons } from '$data/icons';
	import {
		getRootPathAccount,
		getAccountNewExtensionPath,
		getAccountNewStackPath,
		getAccountExtensionEditorPath,
		getAccountStackEditorPath,
		protectedAccountExtensionsPagePresenter
	} from '$lib/area-protected';
	import { getRootPathPublicExtension } from '$lib/area-public/constants/getRootPathPublicExtensions';
	import { getRootPathPublicStack } from '$lib/area-public/constants/getRootPathPublicStacks';
	import { deleteMyListingVerificationPresenter } from '$lib/listings';
	import { showListingBookmarkToast } from '$lib/listings/utils/listingBookmarkFeedback';
	import { saveAgentBuilderStackDraft } from '$lib/stack-builder/constants/agentBuilderDraftStorage';
	import { buildStackDraftFromExtensionSelection } from '$lib/stack-builder/utils/buildStackDraftFromExtensionSelection';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tabs from '$lib/ui/tabs';
	import AccountViralFormatsExploreTab from '$lib/ui/components/extensions/AccountViralFormatsExploreTab.svelte';
	import AccountViralFormatsMineTab from '$lib/ui/components/extensions/AccountViralFormatsMineTab.svelte';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';

	type Props = { data: PageData };
	type ViralFormatsTab = 'explore' | 'mine';

	let { data }: Props = $props();

	const pagePresenter = protectedAccountExtensionsPagePresenter;

	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);
	const newExtensionHref = url(`${route(getRootPathAccount())}/${getAccountNewExtensionPath()}`);
	const newStackHref = url(`${route(getRootPathAccount())}/${getAccountNewStackPath()}`);

	const exploreFilters = $derived(pagePresenter.exploreFilters);
	const exploreCategories = $derived(pagePresenter.exploreCategoriesVm);
	const exploreTagFilterVm = $derived(pagePresenter.exploreTagFilterVm);
	const exploreExtensions = $derived(pagePresenter.filteredExploreExtensionsVm);
	const exploreStacks = $derived(pagePresenter.filteredExploreStacksVm);
	const showExploreExtensions = $derived(pagePresenter.showExploreExtensions);
	const showExploreStacks = $derived(pagePresenter.showExploreStacks);
	const loadingExplore = $derived(pagePresenter.loadingExplore);

	const ownExtensions = $derived(pagePresenter.ownExtensionsVm);
	const ownStacks = $derived(pagePresenter.ownStacksVm);
	const loadingOwn = $derived(pagePresenter.loadingOwn);
	const bookmarksPaidEnabled = $derived(pagePresenter.bookmarksPaidEnabled);
	const bookmarkCount = $derived(pagePresenter.bookmarkCount);
	const selectedCount = $derived(pagePresenter.selectedExtensionCount);
	const togglingBookmarkId = $derived(pagePresenter.togglingBookmarkId);
	const isLoggedIn = $derived(data.isLoggedIn === true);

	let activeTab = $state<ViralFormatsTab>('explore');
	let deleteModalOpen = $state(false);
	let listingToDelete = $state<AccountListingCollectionItemViewModel | null>(null);

	onMount(() => {
		if (!browser) return;
		void (async () => {
			const paid = await pagePresenter.loadBillingGateStateless();
			await Promise.all([pagePresenter.loadExploreCatalog(), pagePresenter.loadOwnListings()]);
			if (paid) {
				await pagePresenter.loadBookmarks();
			}
		})();
	});

	function getOwnEditHref(item: AccountListingCollectionItemViewModel): string {
		const accountRoot = route(getRootPathAccount());
		if (item.listingKind === 'stack') {
			return url(`${accountRoot}/${getAccountStackEditorPath(item.id)}`);
		}
		return url(`${accountRoot}/${getAccountExtensionEditorPath(item.id)}`);
	}

	function getPublicHref(item: AccountListingCollectionItemViewModel): string {
		if (item.listingKind === 'stack') {
			return url(`/${getRootPathPublicStack(item.slug)}`);
		}
		return url(`/${getRootPathPublicExtension(item.slug)}`);
	}

	function ownMenuItems(item: AccountListingCollectionItemViewModel) {
		return [
			{
				label: 'Edit',
				onSelect: () => {
					void goto(getOwnEditHref(item));
				}
			},
			{
				label: 'Delete',
				destructive: true,
				onSelect: () => {
					listingToDelete = item;
					deleteModalOpen = true;
				}
			}
		];
	}

	function exploreMenuItems(item: AccountListingCollectionItemViewModel) {
		const bookmarked = pagePresenter.isBookmarked(item.id);
		return [
			{
				label: bookmarked ? 'Remove bookmark' : 'Bookmark',
				onSelect: () => {
					if (!bookmarksPaidEnabled && !bookmarked) {
						toast.error('Bookmarks require a paid plan.');
						return;
					}
					void handleToggleBookmark(item.id, !bookmarked);
				},
				disabled: togglingBookmarkId === item.id
			},
			{
				label: 'View on hub',
				onSelect: () => {
					void goto(getPublicHref(item));
				}
			}
		];
	}

	async function handleToggleBookmark(listingId: string, nextBookmarked: boolean) {
		const item =
			exploreExtensions.find((entry) => entry.id === listingId) ??
			exploreStacks.find((entry) => entry.id === listingId);
		const listingKind = item?.listingKind ?? 'extension';

		const result = await pagePresenter.toggleBookmark(listingId, nextBookmarked);
		if (!result.ok) {
			toast.error(result.error);
			return { ok: false as const, error: result.error };
		}
		showListingBookmarkToast(nextBookmarked, listingKind);
		return { ok: true as const, bookmarked: nextBookmarked };
	}

	function handleToggleSelect(listingId: string) {
		pagePresenter.toggleExtensionSelection(listingId);
	}

	function handleCreateStackFromSelection() {
		const selected = pagePresenter.getSelectedExtensions();
		if (selected.length === 0) {
			toast.error('Select at least one extension.');
			return;
		}
		const draft = buildStackDraftFromExtensionSelection(
			selected.map((item) => ({
				id: item.id,
				slug: item.slug,
				extensionType: item.extensionType
			}))
		);
		saveAgentBuilderStackDraft(draft);
		pagePresenter.clearExtensionSelection();
		void goto(newStackHref);
	}

	function handleBookmarkedFilterToggle() {
		if (!exploreFilters.bookmarkedOnly && bookmarksPaidEnabled === false) {
			toast.error('Bookmarks require a paid plan.');
			return;
		}
		pagePresenter.setExploreFilters({ bookmarkedOnly: !exploreFilters.bookmarkedOnly });
	}

	async function handleDeleteSuccess() {
		if (!listingToDelete) return;
		const result = await pagePresenter.deleteOwnListing(listingToDelete.id);
		if (!result.ok) {
			toast.error(result.error ?? 'Failed to delete listing.');
			return;
		}
		toast.success('Listing deleted.');
		listingToDelete = null;
		deleteModalOpen = false;
	}
</script>

<div class="flex flex-col gap-5">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-base-content">Viral Formats</h1>
			<p class="mt-1 max-w-2xl text-sm text-base-content/65">
				Explore extensions and stacks from the hub, save bookmarks, and manage your own viral
				formats.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			{#if activeTab === 'mine'}
				<Button href={newExtensionHref} variant="outline" size="sm">New extension</Button>
				<Button href={newStackHref} variant="primary" size="sm">New stack</Button>
			{/if}
		</div>
	</div>

	<Tabs.Root bind:value={activeTab} class="space-y-5">
		<Tabs.List class="tabs tabs-bordered w-full justify-start bg-transparent p-0">
			<Tabs.Trigger value="explore" class="gap-2">
				<AbstractIcon name={icons.Search.name} class="size-4" width="16" height="16" />
				Explore
			</Tabs.Trigger>
			<Tabs.Trigger value="mine" class="gap-2">
				<AbstractIcon name={icons.Bot.name} class="size-4" width="16" height="16" />
				My Viral Formats
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="explore" class="mt-0">
			<AccountViralFormatsExploreTab
				filters={exploreFilters}
				categoriesVm={exploreCategories}
				tagFilterVm={exploreTagFilterVm}
				extensions={exploreExtensions}
				stacks={exploreStacks}
				loading={loadingExplore}
				showExtensions={showExploreExtensions}
				showStacks={showExploreStacks}
				{bookmarksPaidEnabled}
				{bookmarkCount}
				{accountBillingHref}
				selectableExtensions={true}
				isSelected={(id) => pagePresenter.isExtensionSelected(id)}
				onToggleSelect={handleToggleSelect}
				getPublicHref={getPublicHref}
				getMenuItems={exploreMenuItems}
				onSearchChange={(value) => pagePresenter.setExploreFilters({ search: value })}
				onCategorySelect={(slug) => pagePresenter.setExploreFilters({ category: slug })}
				onKindSelect={(kind) => pagePresenter.setExploreFilters({ listingKind: kind })}
				onTagGroupSelect={(groupSlug) =>
					pagePresenter.setExploreFilters({ tagGroup: groupSlug, tags: [] })}
				onTagToggle={(tagSlug) => pagePresenter.toggleExploreTag(tagSlug)}
				onClearTagFilters={() =>
					pagePresenter.setExploreFilters({ tags: [], tagGroup: null })}
				onBookmarkedToggle={handleBookmarkedFilterToggle}
				{selectedCount}
				onCreateStack={handleCreateStackFromSelection}
				onClearSelection={() => pagePresenter.clearExtensionSelection()}
				showBookmarks={true}
				isBookmarked={(id) => pagePresenter.isBookmarked(id)}
				{isLoggedIn}
				{togglingBookmarkId}
				onToggleBookmark={handleToggleBookmark}
			/>
		</Tabs.Content>

		<Tabs.Content value="mine" class="mt-0">
			<AccountViralFormatsMineTab
				extensions={ownExtensions}
				stacks={ownStacks}
				loading={loadingOwn}
				selectableExtensions={true}
				isSelected={(id) => pagePresenter.isExtensionSelected(id)}
				onToggleSelect={handleToggleSelect}
				getEditHref={getOwnEditHref}
				getMenuItems={ownMenuItems}
				{selectedCount}
				onCreateStack={handleCreateStackFromSelection}
				onClearSelection={() => pagePresenter.clearExtensionSelection()}
			/>
		</Tabs.Content>
	</Tabs.Root>
</div>

{#if listingToDelete}
	<ActionVerificationModal
		data={{ listingId: listingToDelete.id, listingTitle: listingToDelete.title }}
		bind:open={deleteModalOpen}
		executionFunction={deleteMyListingVerificationPresenter.execute}
		status={deleteMyListingVerificationPresenter.status}
		showToastMessage={deleteMyListingVerificationPresenter.showToastMessage}
		toastMessage={deleteMyListingVerificationPresenter.toastMessage}
		buttonIconName={icons.Trash.name}
		buttonText=""
		modalTitle="Delete listing"
		modalDescription={`Are you sure you want to delete "${listingToDelete.title}"? This cannot be undone.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={handleDeleteSuccess}
	/>
{/if}
