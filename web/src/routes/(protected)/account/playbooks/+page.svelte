<script lang="ts">
	import type { PageData } from './$types';
	import type { AccountListingCollectionItemViewModel } from '$lib/area-protected/ProtectedAccountExtensionsPage.presenter.svelte';

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	import { icons } from '$data/icons';
	import {
		getRootPathAccount,
		getAccountNewBuildingBlockPath,
		getAccountBuildingBlockEditorPath,
		getAccountPlaybookEditorPath,
		protectedAccountExtensionsPagePresenter
	} from '$lib/area-protected';
	import { getRootPathPublicBuildingBlock, getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { getRootPathPublicPlaybook, getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { deleteMyListingVerificationPresenter, showListingBookmarkToast } from '$lib/listings';
	import {
		clearSkillBuilderStackDraft,
		saveSkillBuilderStackDraft
	} from '$lib/stack-builder/constants/skillBuilderDraftStorage';
	import { buildStackDraftFromExtensionSelection } from '$lib/stack-builder/utils/buildStackDraftFromExtensionSelection';
	import { serializeExtensionSlugs } from '$lib/stack-builder/utils/parseBuilderQuery';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Tabs from '$lib/ui/tabs';
	import AccountViralFormatsExploreTab from '$lib/ui/components/extensions/AccountViralFormatsExploreTab.svelte';
	import AccountViralFormatsMineTab from '$lib/ui/components/extensions/AccountViralFormatsMineTab.svelte';
	import AccountPlaybooksStatsSection from '$lib/ui/components/home/AccountPlaybooksStatsSection.svelte';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';

	type Props = { data: PageData };
	type ViralFormatsTab = 'explore' | 'mine';

	let { data }: Props = $props();

	const pagePresenter = protectedAccountExtensionsPagePresenter;

	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);
	const publicPlaybooksHref = url(`/${getRootPathPublicPlaybooks()}`);
	const publicBuildingBlocksHref = url(`/${getRootPathPublicBuildingBlocks()}`);
	const newExtensionHref = url(`${route(getRootPathAccount())}/${getAccountNewBuildingBlockPath()}`);
	// /tools/skill-builder
	const rootPathPublicSkillBuilder = getRootPathPublicSkillBuilder();
	const newStackHref = url(route(rootPathPublicSkillBuilder));

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
	const listingHubStatsVm = $derived(pagePresenter.listingHubStatsVm);
	const ownPublishedExtensionCount = $derived(pagePresenter.ownPublishedExtensionCount);
	const ownPublishedStackCount = $derived(pagePresenter.ownPublishedStackCount);
	const selectedCount = $derived(pagePresenter.selectedExtensionCount);
	const togglingBookmarkId = $derived(pagePresenter.togglingBookmarkId);
	const isLoggedIn = $derived(data.isLoggedIn === true);

	let activeTab = $state<ViralFormatsTab>('explore');
	let deleteModalOpen = $state(false);
	let unpublishModalOpen = $state(false);
	let listingToDelete = $state<AccountListingCollectionItemViewModel | null>(null);
	let listingToUnpublish = $state<AccountListingCollectionItemViewModel | null>(null);

	function isOwnListingDraft(item: AccountListingCollectionItemViewModel): boolean {
		return item.isUserPublished !== true;
	}

	type OwnMenuItem = {
		label: string;
		onSelect: () => void;
		destructive?: boolean;
	};

	function ownMenuItems(item: AccountListingCollectionItemViewModel): OwnMenuItem[] {
		const items: OwnMenuItem[] = [
			{
				label: 'Edit',
				onSelect: () => {
					void goto(getOwnEditHref(item));
				}
			}
		];

		if (isOwnListingDraft(item)) {
			items.push({
				label: 'Delete',
				destructive: true,
				onSelect: () => {
					listingToDelete = item;
					deleteModalOpen = true;
				}
			});
		} else {
			items.push({
				label: 'Unpublish',
				onSelect: () => {
					listingToUnpublish = item;
					unpublishModalOpen = true;
				}
			});
		}

		return items;
	}

	onMount(() => {
		if (!browser) return;
		void (async () => {
			const paid = await pagePresenter.loadBillingGateStateless();
			await Promise.all([
				pagePresenter.loadExploreCatalog(),
				pagePresenter.loadOwnListings(),
				pagePresenter.loadListingHubStats()
			]);
			if (paid) {
				await pagePresenter.loadBookmarks();
			}
		})();
	});

	function getOwnEditHref(item: AccountListingCollectionItemViewModel): string {
		const accountRoot = route(getRootPathAccount());
		if (item.listingKind === 'stack') {
			return url(`${accountRoot}/${getAccountPlaybookEditorPath(item.id)}`);
		}
		return url(`${accountRoot}/${getAccountBuildingBlockEditorPath(item.id)}`);
	}

	function getPublicHref(item: AccountListingCollectionItemViewModel): string {
		if (item.listingKind === 'stack') {
			return url(`/${getRootPathPublicPlaybook(item.slug)}`);
		}
		return url(`/${getRootPathPublicBuildingBlock(item.slug)}`);
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

	function handleNewPlaybook() {
		clearSkillBuilderStackDraft();
		void goto(newStackHref);
	}

	function handleCreateStackFromSelection() {
		const selected = pagePresenter.getSelectedExtensions();
		if (selected.length === 0) {
			toast.error('Select at least one building block.');
			return;
		}
		const draft = buildStackDraftFromExtensionSelection(
			selected.map((item) => ({
				id: item.id,
				slug: item.slug,
				extensionType: item.extensionType
			}))
		);
		saveSkillBuilderStackDraft(draft);
		pagePresenter.clearExtensionSelection();
		const params = new URLSearchParams();
		params.set('extensions', serializeExtensionSlugs(draft.extensionSlugs));
		void goto(`${newStackHref}?${params.toString()}`);
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
		pagePresenter.removeOwnListing(listingToDelete.id);
		listingToDelete = null;
		deleteModalOpen = false;
	}

	function handleUnpublishSuccess() {
		listingToUnpublish = null;
		unpublishModalOpen = false;
	}

	async function executeUnpublish(data: unknown) {
		const { listingId } = data as { listingId: string };
		const result = await pagePresenter.unpublishOwnListing(listingId);
		if (result.ok) {
			return { success: true, message: 'Removed from hub. You can republish from the editor.' };
		}
		return { success: false, message: result.error ?? 'Failed to unpublish listing.' };
	}
</script>

<div class="flex flex-col gap-5">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-base-content">Playbooks</h1>
			<p class="mt-1 max-w-2xl text-sm text-base-content/65">
				Explore playbooks and building blocks from the hub, save bookmarks, and publish your own.
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			{#if activeTab === 'mine'}
				<Button href={newExtensionHref} variant="outline" size="sm">New building block</Button>
				<Button variant="primary" size="sm" onclick={handleNewPlaybook}>New playbook</Button>
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
				My Playbooks
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

		<Tabs.Content value="mine" class="mt-0 space-y-5">
			<AccountPlaybooksStatsSection
				buildingBlockCount={ownExtensions.length}
				publishedBuildingBlockCount={ownPublishedExtensionCount}
				playbookCount={ownStacks.length}
				publishedPlaybookCount={ownPublishedStackCount}
				hubStats={listingHubStatsVm}
				{publicPlaybooksHref}
				{publicBuildingBlocksHref}
			/>
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
		modalTitle="Delete draft"
		modalDescription={`Permanently delete "${listingToDelete.title}"? This cannot be undone.`}
		modalVerficationWithAnswer={true}
		modalVerificationAnswer="YES"
		onSuccess={handleDeleteSuccess}
	/>
{/if}

{#if listingToUnpublish}
	<ActionVerificationModal
		data={{ listingId: listingToUnpublish.id }}
		bind:open={unpublishModalOpen}
		executionFunction={executeUnpublish}
		buttonIconName={icons.Eye.name}
		buttonText=""
		modalTitle="Remove from hub"
		modalDescription={`Unpublish "${listingToUnpublish.title}"? It will no longer appear on the public catalog. Bookmarks and included building blocks are kept; you can republish from the editor.`}
		modalVerficationWithAnswer={false}
		onSuccess={handleUnpublishSuccess}
	/>
{/if}
