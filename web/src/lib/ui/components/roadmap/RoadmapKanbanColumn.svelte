<script lang="ts">
	import type { RoadmapColumnOptionViewModel, RoadmapItemViewModel } from '$lib/roadmap/roadmap.types';

	import { icons } from '$data/icons';

	import KanbanColumnShell from '$lib/ui/components/kanban-board/KanbanColumnShell.svelte';
	import RoadmapCard from '$lib/ui/components/roadmap/RoadmapCard.svelte';
	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		columnOptionVm: RoadmapColumnOptionViewModel;
		itemsVm: RoadmapItemViewModel[];
	};

	let { columnOptionVm, itemsVm }: Props = $props();

	const countLabel = $derived(String(itemsVm.length));
</script>

<KanbanColumnShell
	title={columnOptionVm.title}
	countLabel={countLabel}
	countTitle="Items in this column"
	statusDotClass={columnOptionVm.statusDotClass}
>
	{#if itemsVm.length === 0}
		<div class="flex flex-1 flex-col items-center justify-center gap-3 px-2 py-10 text-center">
			<div
				class="flex size-14 items-center justify-center rounded-full border border-base-300/80 bg-base-100/70 text-info"
			>
				<AbstractIcon
					name={icons.Light.name}
					class="size-6 shrink-0"
					width="24"
					height="24"
					aria-hidden="true"
				/>
			</div>
			<div class="max-w-[220px] space-y-1">
				{#if columnOptionVm.emptyTitle}
					<p class="text-sm font-medium text-base-content">
						{columnOptionVm.emptyTitle}
					</p>
				{/if}
				<p class="text-xs leading-relaxed text-base-content/60">
					{columnOptionVm.emptyDescription ?? 'No items in this column yet.'}
				</p>
			</div>
		</div>
	{:else}
		{#each itemsVm as itemVm (itemVm.id)}
			<RoadmapCard {itemVm} />
		{/each}
	{/if}
</KanbanColumnShell>
