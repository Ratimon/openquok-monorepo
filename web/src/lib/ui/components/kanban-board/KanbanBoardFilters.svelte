<script lang="ts">
	import type {
		CalendarPostRowViewModel,
		ChannelViewModel,
		PostKanbanSourceFilter,
		PostKanbanSourceFilterOptionViewModel,
		PostKanbanTimeFilter,
		PostKanbanTimeFilterOptionViewModel,
		PostTagFilterVm,
		PostTagViewModel,
		SocialPlatformFilterVm
	} from '$lib/posts';

	import { icons } from '$data/icons';

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
		timeFilterOptions: readonly PostKanbanTimeFilterOptionViewModel[];
		timeFilter: PostKanbanTimeFilter;
		sourceFilterOptions: readonly PostKanbanSourceFilterOptionViewModel[];
		sourceFilter: PostKanbanSourceFilter;
		calendarHref: string;
		onGroupFilterChange: (next: { allGroups: boolean; selectedGroupIds: string[] }) => void;
		onSocialPlatformFilterChange: (next: SocialPlatformFilterVm) => void;
		onTagFilterChange: (next: PostTagFilterVm) => void;
		onTimeFilterChange: (next: PostKanbanTimeFilter) => void;
		onSourceFilterChange: (next: PostKanbanSourceFilter) => void;
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
		timeFilterOptions,
		timeFilter,
		sourceFilterOptions,
		sourceFilter,
		calendarHref,
		onGroupFilterChange,
		onSocialPlatformFilterChange,
		onTagFilterChange,
		onTimeFilterChange,
		onSourceFilterChange
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

	<div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
		<div class="flex max-w-full flex-wrap items-center gap-2">
			<div
				class="inline-flex max-w-full overflow-x-auto rounded-lg border border-base-300 bg-base-100"
				role="group"
				aria-label="Filter by publish date"
			>
				{#each timeFilterOptions as opt (opt.id)}
					<Button
						type="button"
						variant={timeFilter === opt.id ? 'secondary' : 'ghost'}
						size="sm"
						class="shrink-0 rounded-none px-3"
						aria-pressed={timeFilter === opt.id}
						onclick={() => onTimeFilterChange(opt.id)}
					>
						{opt.label}
					</Button>
				{/each}
			</div>
			<Button
				href={calendarHref}
				variant="outline"
				size="sm"
				class="shrink-0 gap-1.5"
				aria-label="View past posts in calendar"
			>
				<AbstractIcon
					name={icons.CalendarClock.name}
					class="size-4"
					width="16"
					height="16"
				/>
				Past posts
			</Button>
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
