<script lang="ts">
	import type {
		PostKanbanSourceFilter,
		PostKanbanSourceFilterOptionViewModel,
		PostKanbanTimeFilter,
		PostKanbanTimeFilterOptionViewModel
	} from '$lib/posts';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		timeFilterOptions: readonly PostKanbanTimeFilterOptionViewModel[];
		timeFilter: PostKanbanTimeFilter;
		sourceFilterOptions: readonly PostKanbanSourceFilterOptionViewModel[];
		sourceFilter: PostKanbanSourceFilter;
		calendarHref: string;
		onTimeFilterChange: (next: PostKanbanTimeFilter) => void;
		onSourceFilterChange: (next: PostKanbanSourceFilter) => void;
	};

	let {
		timeFilterOptions,
		timeFilter,
		sourceFilterOptions,
		sourceFilter,
		calendarHref,
		onTimeFilterChange,
		onSourceFilterChange
	}: Props = $props();
</script>

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
