<script lang="ts">
	import type { PageData } from './$types';
	import type { AccountListingCollectionItemViewModel } from '$lib/area-protected/ProtectedAccountBuildingBlocksPage.presenter.svelte';

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { icons } from '$data/icons';
	import { getProfilePresenter } from '$lib/account';
	import { hasPublicUsername } from '$lib/account/utils/hasPublicUsername';
	import { protectedAccountBuildingBlocksPagePresenter } from '$lib/area-protected';
	import {
		getRootPathAccount,
		getRootPathChooseUsername,
		getAccountNewBuildingBlockPath,
		getAccountBuildingBlockEditorPath,
		getAccountPlaybookEditorPath
	} from '$lib/area-protected/getRootPathProtectedArea';
	import {
		buildAccountSavedHubSearchParams,
		parseSavedBookmarkedFilter,
		parseSavedHubTab,
		parseSavedLibsSegment,
		type SavedHubTabId,
		type SavedLibsSegmentId
	} from '$lib/area-protected/utils/buildAccountSavedHubSearch';
	import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { getRootPathPublicPlaybooks } from '$lib/area-public/constants/getRootPathPublicPlaybooks';
	import {
		resolvePublicBuildingBlockPath,
		resolvePublicPlaybookPath
	} from '$lib/area-public/utils/resolvePublicListingPaths';
	import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
	import { deleteMyListingVerificationPresenter, showListingBookmarkToast } from '$lib/listings';
	import {
		clearSkillBuilderStackDraft,
		saveSkillBuilderStackDraft
	} from '$lib/skill-builder/constants/skillBuilderDraftStorage';
	import { buildStackDraftFromBuildingBlockSelection } from '$lib/skill-builder/utils/buildStackDraftFromBuildingBlockSelection';
	import {
		SKILL_BUILDER_BUILDING_BLOCKS_QUERY_PARAM,
		serializeExtensionSlugs
	} from '$lib/skill-builder/utils/parseBuilderQuery';
	import { route, url } from '$lib/utils/path';
	import { toast } from '$lib/ui/sonner';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import AccountAreaPageHeaderSync from '$lib/ui/components/account/AccountAreaPageHeaderSync.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import AccountSavedBacklinksTab from '$lib/ui/components/account/AccountSavedBacklinksTab.svelte';
	import AccountSavedLibsTab from '$lib/ui/components/account/AccountSavedLibsTab.svelte';
	import ActionVerificationModal from '$lib/ui/modals/ActionVerificationModal.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();

	const pagePresenter = protectedAccountBuildingBlocksPagePresenter;

	const accountBillingHref = url(`${route(getRootPathAccount())}/billing`);
	const publicPlaybooksHref = url(`/${getRootPathPublicPlaybooks()}`);
	const publicBuildingBlocksHref = url(`/${getRootPathPublicBuildingBlocks()}`);
	const newBuildingBlockHref = url(`${route(getRootPathAccount())}/${getAccountNewBuildingBlockPath()}`);
	const chooseUsernameHref = url(route(`/${getRootPathAccount()}/${getRootPathChooseUsername()}`));
	const accountSettingsHref = url(route(`/${getRootPathAccount()}/settings`));
	// /tools/skill-builder
	const rootPathPublicSkillBuilder = getRootPathPublicSkillBuilder();
	const newStackHref = url(route(rootPathPublicSkillBuilder));

	const exploreFilters = $derived(pagePresenter.exploreFilters);
	const exploreCategories = $derived(pagePresenter.exploreCategoriesVm);
	const exploreTagFilterVm = $derived(pagePresenter.exploreTagFilterVm);
	const exploreBuildingBlocks = $derived(pagePresenter.filteredExploreBuildingBlocksVm);
	const exploreStacks = $derived(pagePresenter.filteredExploreStacksVm);
	const showExploreBuildingBlocks = $derived(pagePresenter.showExploreBuildingBlocks);
	const showExploreStacks = $derived(pagePresenter.showExploreStacks);
	const loadingExplore = $derived(pagePresenter.loadingExplore);

	const ownBuildingBlocks = $derived(pagePresenter.ownBuildingBlocksVm);
	const ownStacks = $derived(pagePresenter.ownStacksVm);
	const loadingOwn = $derived(pagePresenter.loadingOwn);
	const bookmarksPaidEnabled = $derived(pagePresenter.bookmarksPaidEnabled);
	const bookmarkCount = $derived(pagePresenter.bookmarkCount);
	const listingHubStatsVm = $derived(pagePresenter.listingHubStatsVm);
	const ownPublishedBuildingBlockCount = $derived(pagePresenter.ownPublishedBuildingBlockCount);
	const ownPublishedStackCount = $derived(pagePresenter.ownPublishedStackCount);
	const selectedCount = $derived(pagePresenter.selectedBuildingBlockCount);
	const togglingBookmarkId = $derived(pagePresenter.togglingBookmarkId);
	const isLoggedIn = $derived(data.isLoggedIn === true);

	let needsCreatorUsername = $state(false);

	let bookmarkedFromUrlApplied = $state(false);

	const activeTab = $derived(parseSavedHubTab(page.url.searchParams.get('tab')));
	const libsSegment = $derived(
		parseSavedLibsSegment(page.url.searchParams.get('tab'), page.url.searchParams.get('libs'))
	);

	const savedHubTabTriggerClass =
		'inline-flex h-auto min-h-0 flex-1 items-center justify-center gap-2 rounded-md border-0 !border-b-0 bg-transparent px-3 py-2 text-sm font-medium text-base-content/65 transition-colors hover:bg-base-content/10 hover:text-base-content sm:flex-none sm:px-4 [&.tab-active]:bg-primary [&.tab-active]:font-semibold [&.tab-active]:text-primary-content [&.tab-active]:shadow-md';
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

	$effect(() => {
		if (!bookmarkedFromUrlApplied && parseSavedBookmarkedFilter(page.url.searchParams.get('bookmarked'))) {
			bookmarkedFromUrlApplied = true;
			pagePresenter.setExploreFilters({ bookmarkedOnly: true });
		}
	});

	function syncSavedHubUrl(options?: {
		tab?: SavedHubTabId;
		libsSegment?: SavedLibsSegmentId;
		bookmarkedOnly?: boolean;
	}) {
		const tab = options?.tab ?? activeTab;
		const segment = options?.libsSegment ?? libsSegment;
		const bookmarkedOnly =
			options?.bookmarkedOnly ??
			(tab === 'libs' && segment === 'browse' && exploreFilters.bookmarkedOnly);
		const search = buildAccountSavedHubSearchParams({
			tab,
			libsSegment: segment,
			bookmarkedOnly
		});
		const nextHref = `${page.url.pathname}?${search}`;
		const currentHref = `${page.url.pathname}${page.url.search}`;
		if (nextHref !== currentHref) {
			void goto(nextHref, { replaceState: true, keepFocus: true, noScroll: true });
		}
	}

	function setSavedHubTab(next: SavedHubTabId) {
		if (next === activeTab) return;
		syncSavedHubUrl({ tab: next });
	}

	function setLibsSegment(next: SavedLibsSegmentId) {
		if (next === libsSegment) return;
		syncSavedHubUrl({ tab: 'libs', libsSegment: next });
	}

	function savedHubTabButtonClass(selected: boolean): string {
		return `${savedHubTabTriggerClass} ${selected ? 'tab-active' : ''}`;
	}

	onMount(() => {
		if (!browser) return;
		void (async () => {
			const [paid, profile] = await Promise.all([
				pagePresenter.loadBillingGateStateless(),
				getProfilePresenter.loadProfileVm()
			]);
			needsCreatorUsername = !hasPublicUsername(profile?.username);
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
		const owner = item.ownerUsername ? { username: item.ownerUsername } : null;
		const path =
			item.listingKind === 'stack'
				? resolvePublicPlaybookPath(owner, item.slug)
				: resolvePublicBuildingBlockPath(owner, item.slug);
		if (path) return url(`/${path}`);
		return url(
			`/${item.listingKind === 'stack' ? getRootPathPublicPlaybooks() : getRootPathPublicBuildingBlocks()}`
		);
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
			exploreBuildingBlocks.find((entry) => entry.id === listingId) ??
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
		pagePresenter.toggleBuildingBlockSelection(listingId);
	}

	function handleNewPlaybook() {
		clearSkillBuilderStackDraft();
		void goto(newStackHref);
	}

	function handleCreateStackFromSelection() {
		const selected = pagePresenter.getSelectedBuildingBlocks();
		if (selected.length === 0) {
			toast.error('Select at least one building block.');
			return;
		}
		const draft = buildStackDraftFromBuildingBlockSelection(
			selected.map((item) => ({
				id: item.id,
				slug: item.slug,
				extensionType: item.extensionType
			}))
		);
		saveSkillBuilderStackDraft(draft);
		pagePresenter.clearBuildingBlockSelection();
		const params = new URLSearchParams();
		params.set(SKILL_BUILDER_BUILDING_BLOCKS_QUERY_PARAM, serializeExtensionSlugs(draft.extensionSlugs));
		void goto(`${newStackHref}?${params.toString()}`);
	}

	function handleBookmarkedFilterToggle() {
		if (!exploreFilters.bookmarkedOnly && bookmarksPaidEnabled === false) {
			toast.error('Bookmarks require a paid plan.');
			return;
		}
		const nextBookmarkedOnly = !exploreFilters.bookmarkedOnly;
		pagePresenter.setExploreFilters({ bookmarkedOnly: nextBookmarkedOnly });
		syncSavedHubUrl({
			tab: 'libs',
			libsSegment: 'browse',
			bookmarkedOnly: nextBookmarkedOnly
		});
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
	{#if needsCreatorUsername}
		<div class="alert alert-info">
			<div class="min-w-0">
				<p class="font-medium">Choose a public username</p>
				<p class="text-sm opacity-90">
					Your building blocks and playbooks publish under
					<span class="font-mono">/creators/your-username/…</span>. Set a username before creating
					or publishing your own listings.
				</p>
				<div class="mt-2 flex flex-wrap gap-2">
					<Button href={chooseUsernameHref} variant="primary" size="sm">Choose username</Button>
					<Button href={accountSettingsHref} variant="ghost" size="sm">Account settings</Button>
				</div>
			</div>
		</div>
	{/if}

	<AccountAreaPageHeaderSync
		title="Saved playbooks & backlinks"
		currentPageLabel="Saved playbooks & backlinks"
		headingId="account-saved-heading"
		description="Browse and Manage your AI library (playbooks/ building blocks), and your backlinks."
	/>

	<div class="space-y-5">
		<div
			class="grid w-full max-w-md grid-cols-2 gap-1 rounded-xl bg-base-200 p-1 sm:inline-flex sm:w-auto sm:grid-cols-none"
			role="tablist"
			aria-label="Saved sections"
		>
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === 'libs'}
				class={savedHubTabButtonClass(activeTab === 'libs')}
				onclick={() => setSavedHubTab('libs')}
			>
				<AbstractIcon name={icons.Bookmark.name} class="size-4 shrink-0" width="16" height="16" />
				Libs
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={activeTab === 'backlinks'}
				class={savedHubTabButtonClass(activeTab === 'backlinks')}
				onclick={() => setSavedHubTab('backlinks')}
			>
				<AbstractIcon name={icons.Link.name} class="size-4 shrink-0" width="16" height="16" />
				Backlinks
			</button>
		</div>

		{#if activeTab === 'libs'}
			<AccountSavedLibsTab
				{libsSegment}
				onLibsSegmentChange={setLibsSegment}
				{newBuildingBlockHref}
				onNewPlaybook={handleNewPlaybook}
				filters={exploreFilters}
				categoriesVm={exploreCategories}
				tagFilterVm={exploreTagFilterVm}
				exploreBuildingBlocks={exploreBuildingBlocks}
				exploreStacks={exploreStacks}
				loadingExplore={loadingExplore}
				showExploreBuildingBlocks={showExploreBuildingBlocks}
				showExploreStacks={showExploreStacks}
				{bookmarksPaidEnabled}
				{bookmarkCount}
				{accountBillingHref}
				isBuildingBlockSelected={(id) => pagePresenter.isBuildingBlockSelected(id)}
				onToggleSelect={handleToggleSelect}
				{getPublicHref}
				exploreMenuItems={exploreMenuItems}
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
				onClearSelection={() => pagePresenter.clearBuildingBlockSelection()}
				isBookmarked={(id) => pagePresenter.isBookmarked(id)}
				{isLoggedIn}
				{togglingBookmarkId}
				onToggleBookmark={handleToggleBookmark}
				{ownBuildingBlocks}
				{ownStacks}
				loadingOwn={loadingOwn}
				{ownPublishedBuildingBlockCount}
				{ownPublishedStackCount}
				listingHubStatsVm={listingHubStatsVm}
				{publicPlaybooksHref}
				{publicBuildingBlocksHref}
				{getOwnEditHref}
				ownMenuItems={ownMenuItems}
			/>
		{:else}
			<AccountSavedBacklinksTab {isLoggedIn} />
		{/if}
	</div>
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
