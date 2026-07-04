<script lang="ts">
	import type { ExtensionCardViewModel } from '$lib/listings/index';

	import { icons } from '$data/icons';

	import { getRootPathPublicBuildingBlocks } from '$lib/area-public/constants/getRootPathPublicBuildingBlocks';
	import { resolvePublicBuildingBlockPath } from '$lib/area-public/utils/resolvePublicListingPaths';
	import { url } from '$lib/utils/path';

	import * as Collapsible from '$lib/ui/collapsible/index.js';
	import { cn } from '$lib/ui/helpers/common';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import ExtensionCardExpanded from '$lib/ui/templates/extensions/ExtensionCardExpanded.svelte';
	import ExtensionBookmarkButton from '$lib/ui/components/extensions/ExtensionBookmarkButton.svelte';

	type ToggleResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

	type Props = {
		extensionVm: ExtensionCardViewModel;
		expanded: boolean;
		onToggle?: (id: string) => void;
		class?: string;
		showBookmark?: boolean;
		isBookmarked?: boolean;
		isLoggedIn?: boolean;
		bookmarksPaidEnabled?: boolean | null;
		upgradeHref?: string;
		onToggleBookmark?: (listingId: string, nextBookmarked: boolean) => Promise<ToggleResult>;
		selectable?: boolean;
		selected?: boolean;
		onToggleSelect?: (id: string) => void;
	};

	let {
		extensionVm,
		expanded = false,
		onToggle,
		class: className = '',
		showBookmark = false,
		isBookmarked = false,
		isLoggedIn = false,
		bookmarksPaidEnabled = null,
		upgradeHref,
		onToggleBookmark,
		selectable = false,
		selected = false,
		onToggleSelect
	}: Props = $props();

	const detailHref = $derived.by(() => {
		const path = resolvePublicBuildingBlockPath(
			extensionVm.ownerUsername ? { username: extensionVm.ownerUsername } : null,
			extensionVm.slug
		);
		return path ? url(`/${path}`) : url(`/${getRootPathPublicBuildingBlocks()}`);
	});
	const typeBadges = $derived.by((): string[] => {
		switch (extensionVm.extensionType) {
			case 'skills':
				return ['Skills'];
			case 'mcp':
				return ['MCP'];
			case 'both':
				return ['MCP', 'Skills'];
			default:
				return ['Extension'];
		}
	});

	const hasBookmark = $derived(showBookmark && !!onToggleBookmark);
	const bookmarkInSelectRow = $derived(hasBookmark && selectable);

	function handleSelectClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		onToggleSelect?.(extensionVm.id);
	}
</script>

<div
	class={cn(
		hasBookmark && !bookmarkInSelectRow && 'relative',
		selectable && selected && 'rounded-2xl ring-2 ring-primary/45',
		className
	)}
>
	{#if hasBookmark && !bookmarkInSelectRow}
		<div class="absolute top-3 right-3 z-10">
			<ExtensionBookmarkButton
				listingId={extensionVm.id}
				{isBookmarked}
				{isLoggedIn}
				{bookmarksPaidEnabled}
				{upgradeHref}
				onToggle={onToggleBookmark!}
			/>
		</div>
	{/if}

<Collapsible.Root
	open={expanded}
	onOpenChange={(open) => {
		if (open !== expanded) onToggle?.(extensionVm.id);
	}}
	class={cn(
		'rounded-2xl border bg-base-100/80',
		selectable && selected
			? 'border-primary/55 bg-primary/5'
			: 'border-base-content/10'
	)}
>
	{#if selectable}
		<div class="border-b border-base-content/10 px-4 pt-4">
			{#if bookmarkInSelectRow}
				<div
					class={cn(
						'flex items-stretch overflow-hidden rounded-xl border text-sm transition focus-within:ring-2 focus-within:ring-primary',
						selected
							? 'border-primary/35 bg-primary/12'
							: 'border-dashed border-primary/30 bg-base-200/50'
					)}
				>
					<button
						type="button"
						class={cn(
							'flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left transition focus-visible:outline-none',
							selected
								? 'text-primary'
								: 'text-base-content/70 hover:bg-primary/8'
						)}
						aria-pressed={selected}
						aria-label={selected
							? `Remove ${extensionVm.title} from skill builder selection`
							: `Add ${extensionVm.title} to skill builder selection`}
						onclick={handleSelectClick}
					>
						<span
							class={cn(
								'pointer-events-none grid size-5 shrink-0 place-items-center rounded-sm border shadow-none',
								selected
									? 'border-primary bg-primary text-primary-content'
									: 'border-primary/55 bg-base-content/15'
							)}
							aria-hidden="true"
						>
							{#if selected}
								<AbstractIcon
									name={icons.Check.name}
									class="size-3"
									width="12"
									height="12"
									aria-hidden="true"
								/>
							{/if}
						</span>
						<span class="min-w-0 font-medium text-base-content">
							{selected ? 'Added to skill builder' : 'Add to skill builder'}
						</span>
					</button>
					<div class="flex shrink-0 items-center border-l border-base-content/10 px-2">
						<ExtensionBookmarkButton
							listingId={extensionVm.id}
							{isBookmarked}
							{isLoggedIn}
							{bookmarksPaidEnabled}
							{upgradeHref}
							onToggle={onToggleBookmark!}
						/>
					</div>
				</div>
			{:else}
				<button
					type="button"
					class={cn(
						'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
						selected
							? 'border-primary/35 bg-primary/12 text-primary'
							: 'border-dashed border-primary/30 bg-base-200/50 text-base-content/70 hover:border-primary/50 hover:bg-primary/8'
					)}
					aria-pressed={selected}
					aria-label={selected
						? `Remove ${extensionVm.title} from skill builder selection`
						: `Add ${extensionVm.title} to skill builder selection`}
					onclick={handleSelectClick}
				>
					<span
						class={cn(
							'pointer-events-none grid size-5 shrink-0 place-items-center rounded-sm border shadow-none',
							selected
								? 'border-primary bg-primary text-primary-content'
								: 'border-primary/55 bg-base-content/15'
						)}
						aria-hidden="true"
					>
						{#if selected}
							<AbstractIcon
								name={icons.Check.name}
								class="size-3"
								width="12"
								height="12"
								aria-hidden="true"
							/>
						{/if}
					</span>
					<span class="font-medium text-base-content">
						{selected ? 'Added to skill builder' : 'Add to skill builder'}
					</span>
				</button>
			{/if}
		</div>
	{/if}
	<Collapsible.Trigger
		class={cn(
			'flex w-full items-start gap-4 p-4 text-left transition hover:bg-base-200/40',
			hasBookmark && !bookmarkInSelectRow && 'pr-12'
		)}
	>
		{#if extensionVm.logoImageUrl}
			<img
				src={extensionVm.logoImageUrl}
				alt=""
				width="48"
				height="48"
				class="size-12 shrink-0 rounded-xl border border-base-content/10 object-cover"
				loading="lazy"
			/>
		{:else}
			<div
				class="grid size-12 shrink-0 place-items-center rounded-xl border border-base-content/10 bg-base-200 text-sm font-bold"
				aria-hidden="true"
			>
				{extensionVm.title.slice(0, 1).toUpperCase()}
			</div>
		{/if}

		<div class="min-w-0 flex-1 space-y-1">
			<div class="flex flex-wrap items-center gap-2">
				<h3 class="text-base font-semibold text-base-content">{extensionVm.title}</h3>
				{#each typeBadges as badge (badge)}
					<span class="badge badge-outline badge-sm">{badge}</span>
				{/each}
				{#if extensionVm.isOfficial}
					<span class="badge badge-outline badge-sm">Official</span>
				{:else}
					<span class="badge badge-outline badge-sm">Community</span>
				{/if}
			</div>
			{#if extensionVm.excerpt || extensionVm.description}
				<p class="line-clamp-2 text-sm text-base-content/70">
					{extensionVm.excerpt ?? extensionVm.description}
				</p>
			{/if}
			<div class="flex flex-wrap gap-3 text-xs text-base-content/60">
				{#if extensionVm.category}
					<span>{extensionVm.category.name}</span>
				{/if}
				<span>{extensionVm.likes} likes</span>
				<span>{extensionVm.views} views</span>
			</div>
		</div>

		<div class="flex shrink-0 items-center self-center">
			<AbstractIcon
				name={expanded ? icons.ChevronUp.name : icons.ChevronDown.name}
				class="size-4 text-base-content/60"
				width="16"
				height="16"
				aria-hidden="true"
			/>
		</div>
	</Collapsible.Trigger>

	<Collapsible.Content class="border-t border-base-content/10 px-4 pb-4">
		<ExtensionCardExpanded extensionVm={extensionVm} detailHref={detailHref} />
	</Collapsible.Content>
</Collapsible.Root>
</div>
