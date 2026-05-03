<script lang="ts">
	import type { Snippet } from 'svelte';

	import type { CalendarGranularityViewModel, CalendarLayoutModeViewModel } from '$lib/posts';
	
	import { icons } from '$data/icons';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';
	import Button from '$lib/ui/buttons/Button.svelte';

	type Props = {
		granularity: CalendarGranularityViewModel;
		layoutMode: CalendarLayoutModeViewModel;
		label: string;
		onToday: () => void;
		onPrev: () => void;
		onNext: () => void;
		onSetGranularity: (g: CalendarGranularityViewModel) => void;
		onSetLayoutMode: (m: CalendarLayoutModeViewModel) => void;
		groupFilter?: Snippet;
	};

	let {
		granularity,
		layoutMode,
		label,
		onToday,
		onPrev,
		onNext,
		onSetGranularity,
		onSetLayoutMode,
		groupFilter
	}: Props = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
	<div class="flex items-center gap-2">
		<div class="inline-flex overflow-hidden rounded-lg border border-base-300 bg-base-100">
			<Button type="button" variant="ghost" class="rounded-none" onclick={onPrev} aria-label="Previous">
				<AbstractIcon name={icons.ChevronLeft.name} class="size-4" width="16" height="16" />
			</Button>
			<div class="px-3 py-2 text-sm font-medium text-base-content/80 min-w-[220px] text-center">
				{label}
			</div>
			<Button type="button" variant="ghost" class="rounded-none" onclick={onNext} aria-label="Next">
				<AbstractIcon name={icons.ChevronRight.name} class="size-4" width="16" height="16" />
			</Button>
		</div>
		<Button type="button" variant="outline" onclick={onToday}>
			Today</Button>
		{@render groupFilter?.()}
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<div class="inline-flex rounded-lg border border-base-300 bg-base-100 p-1">
			<Button
				type="button"
				variant={granularity === 'day' ? 'secondary' : 'ghost'}
				size="sm"
				onclick={() => onSetGranularity('day')}
			>
				Day
			</Button>
			<Button
				type="button"
				variant={granularity === 'week' ? 'secondary' : 'ghost'}
				size="sm"
				onclick={() => onSetGranularity('week')}
			>
				Week
			</Button>
			<Button
				type="button"
				variant={granularity === 'month' ? 'secondary' : 'ghost'}
				size="sm"
				onclick={() => onSetGranularity('month')}
			>
				Month
			</Button>
		</div>

		<div
			class="inline-flex overflow-hidden rounded-lg border border-base-300 bg-base-100"
			role="group"
			aria-label="Calendar or list layout"
		>
			<Button
				type="button"
				variant={layoutMode === 'calendar' ? 'secondary' : 'ghost'}
				size="sm"
				class="rounded-none px-2.5"
				aria-label="Calendar view"
				aria-pressed={layoutMode === 'calendar'}
				onclick={() => onSetLayoutMode('calendar')}
			>
				<AbstractIcon name={icons.CalendarClock.name} class="size-4" width="16" height="16" />
			</Button>
			<Button
				type="button"
				variant={layoutMode === 'list' ? 'secondary' : 'ghost'}
				size="sm"
				class="rounded-none px-2.5"
				aria-label="List view"
				aria-pressed={layoutMode === 'list'}
				onclick={() => onSetLayoutMode('list')}
			>
				<AbstractIcon name={icons.List.name} class="size-4" width="16" height="16" />
			</Button>
		</div>
	</div>
</div>
