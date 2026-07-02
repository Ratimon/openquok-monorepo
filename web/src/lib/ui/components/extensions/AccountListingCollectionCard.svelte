<script lang="ts">
	import type { AccountListingCollectionItemViewModel } from '$lib/area-protected/ProtectedAccountExtensionsPage.presenter.svelte';

	import { icons } from '$data/icons';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Checkbox from '$lib/ui/checkbox/checkbox.svelte';
	import ExtensionBookmarkButton from '$lib/ui/components/extensions/ExtensionBookmarkButton.svelte';
	import { getListingPublishStatusBadge } from '$lib/listings/GetListing.presenter.svelte';
	import * as DropdownMenu from '$lib/ui/dropdown-menu/index.js';

	type ToggleResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

	type MenuItem = {
		label: string;
		onSelect: () => void;
		destructive?: boolean;
		disabled?: boolean;
	};

	type Props = {
		item: AccountListingCollectionItemViewModel;
		selectable?: boolean;
		selected?: boolean;
		onToggleSelect?: () => void;
		menuItems?: MenuItem[];
		href?: string;
		class?: string;
		showBookmark?: boolean;
		isBookmarked?: boolean;
		isLoggedIn?: boolean;
		bookmarksPaidEnabled?: boolean | null;
		upgradeHref?: string;
		bookmarkDisabled?: boolean;
		onToggleBookmark?: (listingId: string, nextBookmarked: boolean) => Promise<ToggleResult>;
		showPublishStatus?: boolean;
	};

	let {
		item,
		selectable = false,
		selected = false,
		onToggleSelect,
		menuItems = [],
		href,
		class: className = '',
		showBookmark = false,
		isBookmarked = false,
		isLoggedIn = false,
		bookmarksPaidEnabled = null,
		upgradeHref,
		bookmarkDisabled = false,
		onToggleBookmark,
		showPublishStatus = false
	}: Props = $props();

	const hasBookmark = $derived(showBookmark && !!onToggleBookmark);
	const hasMenu = $derived(menuItems.length > 0);
	const publishStatusBadge = $derived(
		showPublishStatus
			? getListingPublishStatusBadge(item.isUserPublished, item.isAdminPublished)
			: null
	);

	let checked = $state(false);

	$effect(() => {
		checked = selected;
	});

	function handleSelectClick(event: MouseEvent) {
		event.preventDefault();
		onToggleSelect?.();
	}
</script>

<article
	class={cn(
		'relative flex min-w-[15rem] max-w-full flex-1 items-stretch overflow-hidden rounded-xl border bg-base-200 transition-colors',
		selectable && !selected && 'border-dashed border-primary/35 hover:border-primary/55 hover:bg-base-300/45',
		selectable && selected && 'border-primary bg-base-200 ring-2 ring-primary/45',
		!selectable && 'border-base-300/80',
		className
	)}
>
	{#if selectable}
		<button
			type="button"
			class={cn(
				'flex min-w-[3.25rem] shrink-0 flex-col items-center justify-center gap-1.5 border-r px-2 py-3 transition-colors',
				selected
					? 'border-primary/30 bg-primary/20 text-primary'
					: 'border-base-300/60 bg-base-300/55 text-base-content/55 hover:bg-primary/15 hover:text-primary'
			)}
			aria-pressed={selected}
			aria-label={selected ? `Remove ${item.title} from playbook` : `Add ${item.title} to playbook`}
			onclick={handleSelectClick}
		>
			<Checkbox
				checked={checked}
				class="pointer-events-none size-5 border-primary/50 bg-base-content/12 shadow-none data-[state=unchecked]:border-primary/55 data-[state=unchecked]:bg-base-content/15"
				tabindex={-1}
				aria-hidden="true"
			/>
			<span class="text-[0.625rem] font-semibold tracking-wide uppercase">
				{selected ? 'Added' : 'Add'}
			</span>
		</button>
	{/if}

	{#if href}
		<a {href} class={cn('flex min-w-0 flex-1 items-stretch text-left no-underline', hasBookmark && 'pr-10')}>
			{@render cardBody()}
		</a>
	{:else}
		<div class={cn('flex min-w-0 flex-1 items-stretch', hasBookmark && 'pr-10')}>
			{@render cardBody()}
		</div>
	{/if}

	{#if hasBookmark}
		<div
			class={cn(
				'absolute top-2 z-10',
				hasMenu ? 'right-10' : 'right-2'
			)}
		>
			<ExtensionBookmarkButton
				listingId={item.id}
				listingKind={item.listingKind}
				{isBookmarked}
				{isLoggedIn}
				{bookmarksPaidEnabled}
				{upgradeHref}
				disabled={bookmarkDisabled}
				onToggle={onToggleBookmark!}
			/>
		</div>
	{/if}

	{#if hasMenu}
		<div class="flex items-start p-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger
					type="button"
					class="inline-flex size-8 items-center justify-center rounded-md text-base-content/55 outline-none hover:bg-base-200/60 hover:text-base-content focus-visible:ring-2 focus-visible:ring-primary"
					aria-label={`Actions for ${item.title}`}
				>
					<AbstractIcon
						name={icons.MoreHorizontal.name}
						class="size-4 rotate-90"
						width="16"
						height="16"
					/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="min-w-[10rem]">
					{#each menuItems as menuItem (menuItem.label)}
						<DropdownMenu.Item
							variant={menuItem.destructive ? 'destructive' : 'default'}
							disabled={menuItem.disabled}
							onSelect={menuItem.onSelect}
						>
							{menuItem.label}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}
</article>

{#snippet cardBody()}
	<div class="flex min-w-0 flex-1 items-stretch">
		{#if item.logoImageUrl}
			<img
				src={item.logoImageUrl}
				alt=""
				width="56"
				height="56"
				class="size-14 shrink-0 object-cover"
				loading="lazy"
			/>
		{:else}
			<div
				class="grid size-14 shrink-0 place-items-center bg-neutral text-sm font-semibold uppercase tracking-wide text-neutral-content"
				aria-hidden="true"
			>
				{item.initials}
			</div>
		{/if}
		<div class="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-3">
			<div class="flex min-w-0 items-center gap-2">
				<h3 class="min-w-0 truncate text-sm font-semibold text-base-content">{item.title}</h3>
				{#if publishStatusBadge}
					<span class={cn('shrink-0', publishStatusBadge.className)}>{publishStatusBadge.label}</span>
				{/if}
			</div>
			<p class="truncate text-xs text-base-content/60">{item.subtitle}</p>
		</div>
	</div>
{/snippet}
