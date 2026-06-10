<script lang="ts">
	import { cn } from '$lib/ui/helpers/common';

	import BentoCard from '$lib/ui/templates/bento/BentoCard.svelte';
	import BentoGridOneCol from '$lib/ui/templates/bento/BentoGridOneCol.svelte';
	import BentoInstagramKanbanPreview from '$lib/ui/templates/bento/minor-templates/instagram/BentoInstagramKanbanPreview.svelte';

	type Props = {
		class?: string;
	};

	let { class: className = '' }: Props = $props();
</script>

<BentoGridOneCol class={cn('auto-rows-[minmax(22rem,auto)]', className)}>
	<BentoCard
		class="col-span-1 overflow-hidden shadow-2xl ring-1 ring-base-content/10"
		background={BentoInstagramKanbanPreview}
	/>
</BentoGridOneCol>
