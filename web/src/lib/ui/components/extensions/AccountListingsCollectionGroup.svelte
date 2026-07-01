<script lang="ts">
	import type { AccountListingCollectionItemVm } from '$lib/area-protected/ProtectedAccountExtensionsPage.presenter.svelte';

	import AccountListingCollectionCard from '$lib/ui/components/extensions/AccountListingCollectionCard.svelte';

	type MenuItemFactory = (item: AccountListingCollectionItemVm) => Array<{
		label: string;
		onSelect: () => void;
		destructive?: boolean;
		disabled?: boolean;
	}>;

	type ToggleResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

	type Props = {
		label: string;
		description?: string;
		items: AccountListingCollectionItemVm[];
		loading?: boolean;
		emptyMessage?: string;
		layout?: 'row' | 'grid';
		selectableExtensions?: boolean;
		isSelected?: (listingId: string) => boolean;
		onToggleSelect?: (listingId: string) => void;
		getEditHref?: (item: AccountListingCollectionItemVm) => string;
		getMenuItems?: MenuItemFactory;
		showBookmarks?: boolean;
		isBookmarked?: (listingId: string) => boolean;
		isLoggedIn?: boolean;
		bookmarksPaidEnabled?: boolean | null;
		upgradeHref?: string;
		togglingBookmarkId?: string | null;
		onToggleBookmark?: (listingId: string, nextBookmarked: boolean) => Promise<ToggleResult>;
	};

	let {
		label,
		description,
		items,
		loading = false,
		emptyMessage = 'Nothing here yet.',
		layout = 'row',
		selectableExtensions = false,
		isSelected = () => false,
		onToggleSelect,
		getEditHref,
		getMenuItems,
		showBookmarks = false,
		isBookmarked = () => false,
		isLoggedIn = false,
		bookmarksPaidEnabled = null,
		upgradeHref,
		togglingBookmarkId = null,
		onToggleBookmark
	}: Props = $props();

	const listClass = $derived(
		layout === 'grid'
			? 'grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'
			: 'flex flex-col gap-3 lg:flex-row lg:flex-wrap'
	);

	const itemClass = $derived(
		layout === 'grid' ? 'min-w-0' : 'w-full lg:max-w-[calc(33.333%-0.75rem)] lg:flex-1'
	);
</script>

<div class="space-y-3">
	<div>
		<h3 class="text-sm font-medium text-base-content/55">{label}</h3>
		{#if description}
			<p class="mt-1 text-xs text-base-content/55">{description}</p>
		{/if}
	</div>

	{#if loading}
		<p class="rounded-xl border border-dashed border-base-content/15 px-4 py-6 text-sm text-base-content/60">
			Loading…
		</p>
	{:else if items.length === 0}
		<p class="rounded-xl border border-dashed border-base-content/15 px-4 py-6 text-sm text-base-content/60">
			{emptyMessage}
		</p>
	{:else}
		<ul class={listClass}>
			{#each items as item (item.id)}
				<li class={itemClass}>
					<AccountListingCollectionCard
						{item}
						selectable={selectableExtensions && item.listingKind === 'extension'}
						selected={isSelected(item.id)}
						onToggleSelect={() => onToggleSelect?.(item.id)}
						href={getEditHref?.(item)}
						menuItems={getMenuItems?.(item) ?? []}
						showBookmark={showBookmarks}
						isBookmarked={isBookmarked(item.id)}
						{isLoggedIn}
						{bookmarksPaidEnabled}
						{upgradeHref}
						bookmarkDisabled={togglingBookmarkId === item.id}
						{onToggleBookmark}
					/>
				</li>
			{/each}
		</ul>
	{/if}
</div>
