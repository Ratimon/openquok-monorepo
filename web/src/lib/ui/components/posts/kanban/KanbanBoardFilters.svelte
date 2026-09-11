<script lang="ts">
	import type {
		CalendarPostRowViewModel,
		ChannelViewModel,
		PostKanbanReviewFilter,
		PostKanbanReviewFilterOptionViewModel,
		PostKanbanSourceFilter,
		PostKanbanSourceFilterOptionViewModel,
		PostTagFilterVm,
		PostTagViewModel,
		SocialPlatformFilterVm
	} from '$lib/posts';

	import ChannelGroupFilter from '$lib/ui/components/filters/ChannelGroupFilter.svelte';
	import ChannelKindFilter from '$lib/ui/components/filters/ChannelKindFilter.svelte';
	import TagFilter from '$lib/ui/components/filters/TagFilter.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		channels: ChannelViewModel[];
		allGroups: boolean;
		selectedGroupIds: string[];
		allSocialPlatforms: boolean;
		selectedSocialPlatformIdentifiers: string[];
		allTags: boolean;
		selectedTagNames: string[];
		tagsVm: PostTagViewModel[];
		kanbanPosts: readonly Pick<CalendarPostRowViewModel, 'tagNames'>[];
		sourceFilterOptions: readonly PostKanbanSourceFilterOptionViewModel[];
		sourceFilter: PostKanbanSourceFilter;
		reviewFilterOptions: readonly PostKanbanReviewFilterOptionViewModel[];
		reviewFilter: PostKanbanReviewFilter;
		onGroupFilterChange: (next: { allGroups: boolean; selectedGroupIds: string[] }) => void;
		onSocialPlatformFilterChange: (next: SocialPlatformFilterVm) => void;
		onTagFilterChange: (next: PostTagFilterVm) => void;
		onSourceFilterChange: (next: PostKanbanSourceFilter) => void;
		onReviewFilterChange: (next: PostKanbanReviewFilter) => void;
	};

	let {
		channels,
		allGroups,
		selectedGroupIds,
		allSocialPlatforms,
		selectedSocialPlatformIdentifiers,
		allTags,
		selectedTagNames,
		tagsVm,
		kanbanPosts,
		sourceFilterOptions,
		sourceFilter,
		reviewFilterOptions,
		reviewFilter,
		onGroupFilterChange,
		onSocialPlatformFilterChange,
		onTagFilterChange,
		onSourceFilterChange,
		onReviewFilterChange
	}: Props = $props();

	const hasDistinctSocialPlatforms = $derived.by(() => {
		const ids = new Set<string>();
		for (const c of channels) {
			const id = String(c.identifier ?? '').trim();
			if (id) ids.add(id);
		}
		return ids.size >= 2;
	});
</script>

<div class="flex flex-col gap-2">
	<div class="flex min-w-0 w-full max-w-full flex-wrap items-center gap-2">
		{#if channels.length > 0}
			<ChannelGroupFilter
				{channels}
				{allGroups}
				{selectedGroupIds}
				onChange={onGroupFilterChange}
			/>
		{/if}
		{#if hasDistinctSocialPlatforms}
			<ChannelKindFilter
				{channels}
				{allSocialPlatforms}
				{selectedSocialPlatformIdentifiers}
				onChange={onSocialPlatformFilterChange}
			/>
		{/if}
		<TagFilter
			{tagsVm}
			posts={kanbanPosts}
			{allTags}
			{selectedTagNames}
			onChange={onTagFilterChange}
		/>
	</div>

	<div class="flex max-w-full flex-wrap items-center justify-start gap-2">
		<div
			class="inline-flex overflow-hidden rounded-lg border border-base-300 bg-base-100"
			role="group"
			aria-label="Filter by review status"
		>
			{#each reviewFilterOptions as opt (opt.id)}
				<Button
					type="button"
					variant={reviewFilter === opt.id ? 'secondary' : 'ghost'}
					size="sm"
					class="rounded-none px-3"
					aria-pressed={reviewFilter === opt.id}
					onclick={() => onReviewFilterChange(opt.id)}
				>
					<span class="inline-flex items-center gap-1.5">
						{#if opt.iconName}
							<span class="badge badge-secondary badge-xs shrink-0 border-0 p-0.5">
								<AbstractIcon
									name={opt.iconName}
									class="size-3"
									width="12"
									height="12"
								/>
							</span>
						{/if}
						{opt.label}
					</span>
				</Button>
			{/each}
		</div>
		<div
			class="inline-flex overflow-hidden rounded-lg border border-base-300 bg-base-100"
			role="group"
			aria-label="Filter by source"
		>
			{#each sourceFilterOptions as opt (opt.id)}
				<Button
					type="button"
					variant={sourceFilter === opt.id ? 'secondary' : 'ghost'}
					size="sm"
					class="rounded-none px-3"
					aria-pressed={sourceFilter === opt.id}
					onclick={() => onSourceFilterChange(opt.id)}
				>
					<span class="inline-flex items-center gap-1.5">
						{#if opt.iconName}
							<span class="badge badge-secondary badge-xs shrink-0 border-0 p-0.5">
								<AbstractIcon
									name={opt.iconName}
									class="size-3"
									width="12"
									height="12"
								/>
							</span>
						{/if}
						{opt.label}
					</span>
				</Button>
			{/each}
		</div>
	</div>
</div>
