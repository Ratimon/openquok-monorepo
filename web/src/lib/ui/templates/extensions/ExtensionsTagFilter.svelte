<script lang="ts">
	import type {
		ExtensionTagFilterChip,
		ExtensionTagGroupFilterChip,
		ExtensionsTagFilterViewModel
	} from '$lib/listings/index';

	import { icons } from '$data/icons';

	import { cn } from '$lib/ui/helpers/common';
	import { Badge } from '$lib/ui/badge';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	const COLLAPSED_TAG_LIMIT = 12;

	type Props = {
		tagFilterVm: ExtensionsTagFilterViewModel;
		activeTagGroup?: string | null;
		activeTags?: string[];
		onGroupSelect?: (groupSlug: string | null) => void;
		onTagToggle?: (tagSlug: string) => void;
		onClear?: () => void;
		class?: string;
	};

	let {
		tagFilterVm,
		activeTagGroup = null,
		activeTags = [],
		onGroupSelect,
		onTagToggle,
		onClear,
		class: className = ''
	}: Props = $props();

	let expanded = $state(false);

	const selectedTagSet = $derived(new Set(activeTags));
	const hasTagFilters = $derived(Boolean(activeTagGroup) || selectedTagSet.size > 0);

	const visibleGroups = $derived(tagFilterVm.groups.filter((group) => group.count > 0 || group.tagSlugs.length > 0));

	const scopedTags = $derived.by((): ExtensionTagFilterChip[] => {
		if (!activeTagGroup) return tagFilterVm.tags;
		return tagFilterVm.tags.filter((tag) => tag.groupSlugs.includes(activeTagGroup));
	});

	const visibleTags = $derived.by(() => {
		const rows = activeTagGroup ? scopedTags : tagFilterVm.tags;
		if (expanded || rows.length <= COLLAPSED_TAG_LIMIT) return rows;
		return rows.slice(0, COLLAPSED_TAG_LIMIT);
	});

	const hiddenTagCount = $derived.by(() => {
		const rows = activeTagGroup ? scopedTags : tagFilterVm.tags;
		return Math.max(0, rows.length - COLLAPSED_TAG_LIMIT);
	});

	const groupBadgeVariant = (group: ExtensionTagGroupFilterChip) =>
		activeTagGroup === group.slug && selectedTagSet.size === 0 ? 'default' : 'outline';

	function handleGroupClick(group: ExtensionTagGroupFilterChip) {
		if (activeTagGroup === group.slug && selectedTagSet.size === 0) {
			onGroupSelect?.(null);
			return;
		}
		onGroupSelect?.(group.slug);
	}

	function handleAllClick() {
		onClear?.();
	}
</script>

<div class={cn('space-y-3', className)}>
	{#if visibleGroups.length > 0}
		<div class="space-y-2">
			<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-base-content/45 uppercase">
				Tag Groups
			</p>

			<div
				class="flex flex-wrap items-center gap-2"
				role="group"
				aria-label="Filter by tag group"
			>
			<button
				type="button"
				class={cn(
					'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
					!hasTagFilters
						? 'bg-primary text-primary-content'
						: 'border border-base-content/15 bg-transparent text-base-content/80 hover:bg-base-content/5'
				)}
				aria-pressed={!hasTagFilters}
				onclick={handleAllClick}
			>
				<span>All</span>
				<span class={cn('tabular-nums', !hasTagFilters ? 'text-primary-content/80' : 'text-base-content/50')}>
					{tagFilterVm.totalCount.toLocaleString()}
				</span>
			</button>

			{#each visibleGroups as group (group.slug)}
				<button
					type="button"
					class="inline-flex"
					aria-pressed={activeTagGroup === group.slug && selectedTagSet.size === 0}
					onclick={() => handleGroupClick(group)}
				>
					<Badge variant={groupBadgeVariant(group)} class="cursor-pointer gap-1.5 px-3 py-1.5 text-sm">
						{group.label}
						<span class="tabular-nums opacity-70">{group.count.toLocaleString()}</span>
					</Badge>
				</button>
			{/each}
			</div>
		</div>
	{/if}

	{#if tagFilterVm.tags.length > 0}
		<div class="space-y-2">
			<p class="text-[0.65rem] font-semibold tracking-[0.18em] text-base-content/45 uppercase">Tags</p>

			<div class="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tag">
				{#each visibleTags as tag (tag.slug)}
					{@const isActive = selectedTagSet.has(tag.slug)}
					<button
						type="button"
						class="inline-flex"
						aria-pressed={isActive}
						onclick={() => onTagToggle?.(tag.slug)}
					>
						<Badge
							variant={isActive ? 'default' : 'muted'}
							class={cn('cursor-pointer gap-1.5 px-3 py-1.5 text-sm', !isActive && 'hover:bg-base-content/40')}
							surfaceStyle={!isActive && tag.color ? `background-color: ${tag.color}22; color: inherit;` : undefined}
						>
							{#if tag.color}
								<span
									class="size-2 shrink-0 rounded-full border border-base-content/10"
									style:background-color={tag.color}
									aria-hidden="true"
								></span>
							{/if}
							{tag.label}
							<span class="tabular-nums opacity-70">{tag.count.toLocaleString()}</span>
						</Badge>
					</button>
				{/each}

				{#if hiddenTagCount > 0}
					<button
						type="button"
						class="inline-flex items-center gap-1 rounded-full border border-base-content/15 px-3 py-1.5 text-sm text-base-content/70 hover:bg-base-content/5"
						onclick={() => {
							expanded = !expanded;
						}}
					>
						{expanded ? 'Less' : `More +${hiddenTagCount}`}
						<AbstractIcon
							name={expanded ? icons.ChevronUp.name : icons.ChevronDown.name}
							class="size-3.5"
							width="14"
							height="14"
						/>
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
