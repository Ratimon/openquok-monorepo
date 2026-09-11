<script lang="ts">
	import type {
		PostKanbanPastTimeFilter,
		PostKanbanPastTimeFilterOptionViewModel,
		PostKanbanUpcomingTimeFilter,
		PostKanbanUpcomingTimeFilterOptionViewModel
	} from '$lib/posts';

	import { icons } from '$data/icons';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';
	import * as Select from '$lib/ui/select';

	type Props = {
		upcomingTimeFilterOptions: readonly PostKanbanUpcomingTimeFilterOptionViewModel[];
		upcomingTimeFilter: PostKanbanUpcomingTimeFilter;
		pastTimeFilterOptions: readonly PostKanbanPastTimeFilterOptionViewModel[];
		pastTimeFilter: PostKanbanPastTimeFilter;
		calendarHref: string;
		onUpcomingTimeFilterChange: (next: PostKanbanUpcomingTimeFilter) => void;
		onPastTimeFilterChange: (next: PostKanbanPastTimeFilter) => void;
	};

	let {
		upcomingTimeFilterOptions,
		upcomingTimeFilter,
		pastTimeFilterOptions,
		pastTimeFilter,
		calendarHref,
		onUpcomingTimeFilterChange,
		onPastTimeFilterChange
	}: Props = $props();

	const upcomingLabel = $derived(
		upcomingTimeFilterOptions.find((opt) => opt.id === upcomingTimeFilter)?.label ?? 'All Upcoming'
	);
	const pastLabel = $derived(
		pastTimeFilterOptions.find((opt) => opt.id === pastTimeFilter)?.label ?? 'All Past'
	);
</script>

<!--
  Matches KanbanBoardLayout column widths: two equal flex-1 columns + gap for draft/scheduled,
  one flex-1 column for published.
-->
<div class="flex gap-3 overflow-x-auto" role="presentation">
	<div class="flex min-w-[calc(440px+0.75rem)] flex-[2] flex-col gap-1.5">
		<p class="text-xs font-medium text-base-content/60">Drafted & scheduled</p>

		<div class="flex min-w-0 items-center gap-2 md:hidden">
			<Select.Root
				type="single"
				value={upcomingTimeFilter}
				onValueChange={(value) => {
					if (value) onUpcomingTimeFilterChange(value as PostKanbanUpcomingTimeFilter);
				}}
			>
				<Select.Trigger class="h-8 min-w-0 flex-1" size="sm" aria-label="Filter drafted and scheduled posts by publish date">
					<span class="truncate">{upcomingLabel}</span>
				</Select.Trigger>
				<Select.Content>
					{#each upcomingTimeFilterOptions as opt (opt.id)}
						<Select.Item value={opt.id} label={opt.label} />
					{/each}
				</Select.Content>
			</Select.Root>
			<Button
				href={calendarHref}
				variant="outline"
				size="sm"
				class="shrink-0 px-2.5"
				aria-label="Open calendar view"
			>
				<AbstractIcon
					name={icons.CalendarClock.name}
					class="size-4"
					width="16"
					height="16"
				/>
			</Button>
		</div>

		<div class="hidden min-w-0 flex-wrap items-center gap-2 md:flex">
			<div
				class="inline-flex max-w-full overflow-x-auto rounded-lg border border-base-300 bg-base-100"
				role="group"
				aria-label="Filter drafted and scheduled posts by publish date"
			>
				{#each upcomingTimeFilterOptions as opt (opt.id)}
					<Button
						type="button"
						variant={upcomingTimeFilter === opt.id ? 'secondary' : 'ghost'}
						size="sm"
						class="shrink-0 rounded-none px-3"
						aria-pressed={upcomingTimeFilter === opt.id}
						onclick={() => onUpcomingTimeFilterChange(opt.id)}
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
				aria-label="Open calendar view"
			>
				<AbstractIcon
					name={icons.CalendarClock.name}
					class="size-4"
					width="16"
					height="16"
				/>
				Calendar
			</Button>
		</div>
	</div>

	<div class="flex min-w-[220px] flex-1 flex-col gap-1.5">
		<p class="text-xs font-medium text-base-content/60">Published posts</p>

		<div class="md:hidden">
			<Select.Root
				type="single"
				value={pastTimeFilter}
				onValueChange={(value) => {
					if (value) onPastTimeFilterChange(value as PostKanbanPastTimeFilter);
				}}
			>
				<Select.Trigger
					class="h-8 w-full min-w-0"
					size="sm"
					aria-label="Filter published posts by publish date"
				>
					<span class="truncate">{pastLabel}</span>
				</Select.Trigger>
				<Select.Content>
					{#each pastTimeFilterOptions as opt (opt.id)}
						<Select.Item value={opt.id} label={opt.label} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<div
			class="hidden max-w-full overflow-x-auto rounded-lg border border-base-300 bg-base-100 md:inline-flex"
			role="group"
			aria-label="Filter published posts by publish date"
		>
			{#each pastTimeFilterOptions as opt (opt.id)}
				<Button
					type="button"
					variant={pastTimeFilter === opt.id ? 'secondary' : 'ghost'}
					size="sm"
					class="shrink-0 rounded-none px-3"
					aria-pressed={pastTimeFilter === opt.id}
					onclick={() => onPastTimeFilterChange(opt.id)}
				>
					{opt.label}
				</Button>
			{/each}
		</div>
	</div>
</div>
