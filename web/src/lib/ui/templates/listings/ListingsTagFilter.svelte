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

	function compareTagFilterChips(
		a: ExtensionTagFilterChip,
		b: ExtensionTagFilterChip,
		selected: Set<string>
	): number {
		const aSelected = selected.has(a.slug);
		const bSelected = selected.has(b.slug);
		if (aSelected !== bSelected) return aSelected ? -1 : 1;

		const aHasMatches = a.count > 0;
		const bHasMatches = b.count > 0;
		if (aHasMatches !== bHasMatches) return aHasMatches ? -1 : 1;

		if (b.count !== a.count) return b.count - a.count;

		return a.label.localeCompare(b.label);
	}

	function sortTagsForDisplay(
		tags: ExtensionTagFilterChip[],
		selected: Set<string>
	): ExtensionTagFilterChip[] {
		return [...tags].sort((a, b) => compareTagFilterChips(a, b, selected));
	}

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

	const displayTags = $derived.by(() => {
		const rows = activeTagGroup ? scopedTags : tagFilterVm.tags;
		return sortTagsForDisplay(rows, selectedTagSet);
	});

	const visibleTags = $derived.by(() => {
		if (expanded || displayTags.length <= COLLAPSED_TAG_LIMIT) return displayTags;
		return displayTags.slice(0, COLLAPSED_TAG_LIMIT);
	});

	const hiddenTagCount = $derived.by(() => {
		if (expanded) return 0;
		return Math.max(0, displayTags.length - COLLAPSED_TAG_LIMIT);
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

	const chipClass =
		'cursor-pointer gap-1.5 px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
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
			<Badge
				variant={!hasTagFilters ? 'default' : 'outline'}
				class={chipClass}
				ariaPressed={!hasTagFilters}
				onclick={handleAllClick}
			>
				<span>All</span>
				<span class="tabular-nums opacity-70">{tagFilterVm.totalCount.toLocaleString()}</span>
			</Badge>

			{#each visibleGroups as group (group.slug)}
				<Badge
					variant={groupBadgeVariant(group)}
					class={chipClass}
					ariaPressed={activeTagGroup === group.slug && selectedTagSet.size === 0}
					onclick={() => handleGroupClick(group)}
				>
					{group.label}
					<span class="tabular-nums opacity-70">{group.count.toLocaleString()}</span>
				</Badge>
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
					<Badge
						variant={isActive ? 'default' : 'muted'}
						class={cn(chipClass, !isActive && 'hover:bg-base-content/40')}
						surfaceStyle={!isActive && tag.color ? `background-color: ${tag.color}22; color: inherit;` : undefined}
						ariaPressed={isActive}
						onclick={() => onTagToggle?.(tag.slug)}
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
				{/each}

				{#if hiddenTagCount > 0}
					<Badge
						variant="outline"
						class={cn(chipClass, 'text-base-content/70')}
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
					</Badge>
				{/if}
			</div>
		</div>
	{/if}
</div>
