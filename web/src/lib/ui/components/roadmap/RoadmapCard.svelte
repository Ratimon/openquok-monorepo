<script lang="ts">
	import type { RoadmapItemViewModel } from '$lib/roadmap/roadmap.types';

	import { icons } from '$data/icons';

	import { roadmapCategoryLabel } from '$lib/roadmap/constants/roadmapCatalog';

	import AbstractIcon from '$lib/ui/icons/AbstractIcon.svelte';

	type Props = {
		itemVm: RoadmapItemViewModel;
	};

	let { itemVm }: Props = $props();

	const categoryLabel = $derived(roadmapCategoryLabel(itemVm.categoryId));
</script>

<article
	class="flex gap-3 rounded-lg border border-base-300/80 bg-base-100/80 p-3 shadow-sm transition-colors hover:border-base-300"
>
	<div
		class="flex w-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-base-300/80 bg-base-200/70 px-1 py-2 text-base-content/80"
		aria-label="{itemVm.upvoteCount} upvotes"
	>
		<AbstractIcon
			name={icons.ChevronUp.name}
			class="size-4 shrink-0"
			width="16"
			height="16"
			aria-hidden="true"
		/>
		<span class="text-xs font-semibold tabular-nums">
			{itemVm.upvoteCount}
		</span>
	</div>

	<div class="min-w-0 flex-1">
		<h4 class="text-sm font-semibold leading-snug text-base-content">
			{itemVm.title}
		</h4>
		<p class="mt-1 text-[10px] font-semibold tracking-[0.12em] text-base-content/50 uppercase">
			{categoryLabel}
		</p>
	</div>
</article>
